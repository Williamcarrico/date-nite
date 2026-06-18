-- 026: Notification system — core tables, RLS, preferences, helper, realtime.
-- APPLIED 2026-06. Notifications are server-authoritative: rows are created ONLY
-- by SECURITY DEFINER functions (triggers in 027, cron in 029), never by clients.

-- ── notifications ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN (
                 'couple_linked','match_found','date_scheduled',
                 'mystery_created','mystery_revealed','date_reminder','badge_earned')),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  href         TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_recipient_created
  ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_recipient_unread
  ON public.notifications (recipient_id) WHERE read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recipient-scoped. NO INSERT policy -> client inserts denied (rows only via
-- create_notification(), which is SECURITY DEFINER and bypasses RLS).
CREATE POLICY "recipient reads own notifications" ON public.notifications
  FOR SELECT USING (recipient_id = (select auth.uid()));
CREATE POLICY "recipient updates own notifications" ON public.notifications
  FOR UPDATE USING (recipient_id = (select auth.uid()))
              WITH CHECK (recipient_id = (select auth.uid()));
CREATE POLICY "recipient deletes own notifications" ON public.notifications
  FOR DELETE USING (recipient_id = (select auth.uid()));

-- RLS can't restrict UPDATE to a single column; this guard ensures authenticated
-- users can only flip `read` (markAsRead), never rewrite title/type/etc.
CREATE OR REPLACE FUNCTION public.notifications_lock_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (NEW.id, NEW.recipient_id, NEW.type, NEW.title, NEW.body, NEW.href, NEW.metadata, NEW.created_at)
     IS DISTINCT FROM
     (OLD.id, OLD.recipient_id, OLD.type, OLD.title, OLD.body, OLD.href, OLD.metadata, OLD.created_at)
  THEN
    RAISE EXCEPTION 'Only the read flag may be updated on a notification';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notifications_lock_columns() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notifications_lock_columns_trg
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.notifications_lock_columns();

-- Realtime: the bell subscribes filtered on recipient_id=eq.<uid>. REPLICA
-- IDENTITY FULL ships recipient_id on UPDATE/DELETE payloads so the filter holds
-- for all event kinds, not just INSERT. (Realtime respects RLS.)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- ── per-type preferences (JSONB on profiles; missing key = enabled) ───────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ── push_subscriptions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS push_subscriptions_profile ON public.push_subscriptions (profile_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads own subs"   ON public.push_subscriptions
  FOR SELECT USING (profile_id = (select auth.uid()));
CREATE POLICY "owner inserts own subs" ON public.push_subscriptions
  FOR INSERT WITH CHECK (profile_id = (select auth.uid()));
CREATE POLICY "owner updates own subs" ON public.push_subscriptions
  FOR UPDATE USING (profile_id = (select auth.uid()))
              WITH CHECK (profile_id = (select auth.uid()));
CREATE POLICY "owner deletes own subs" ON public.push_subscriptions
  FOR DELETE USING (profile_id = (select auth.uid()));

-- ── create_notification() — internal, pref-gated, bypasses RLS to insert ──────
CREATE OR REPLACE FUNCTION public.create_notification(
  p_recipient UUID,
  p_type      TEXT,
  p_title     TEXT,
  p_body      TEXT,
  p_href      TEXT  DEFAULT NULL,
  p_metadata  JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id    UUID;
  v_prefs JSONB;
BEGIN
  IF p_recipient IS NULL THEN RETURN NULL; END IF;
  SELECT notification_prefs INTO v_prefs FROM public.profiles WHERE id = p_recipient;
  -- Missing key => enabled; only an explicit "false" mutes this type.
  IF v_prefs IS NOT NULL AND (v_prefs ->> p_type) = 'false' THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.notifications (recipient_id, type, title, body, href, metadata)
  VALUES (p_recipient, p_type, p_title, p_body, p_href, COALESCE(p_metadata, '{}'::jsonb))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
-- Internal only: writes for ARBITRARY recipients with no membership check by
-- design (triggers/cron pick the recipient server-side). Must NOT be client-
-- callable (would be an IDOR/spam vector — cf. migration 019).
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid,text,text,text,text,jsonb)
  FROM PUBLIC, anon, authenticated;
