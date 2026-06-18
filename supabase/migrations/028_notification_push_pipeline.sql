-- 028: Web-push delivery pipeline. APPLIED 2026-06. On every notification INSERT,
-- fire-and-forget an HTTP POST (pg_net, async — never blocks/rolls back the
-- originating tx) to the Next.js /api/push route, which signs + sends Web Push
-- via VAPID to the recipient's push_subscriptions. The webhook URL + shared secret
-- live in Vault; if unset, this no-ops and the system degrades to in-app only.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.dispatch_push()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_url    TEXT;
  v_secret TEXT;
BEGIN
  SELECT decrypted_secret INTO v_url    FROM vault.decrypted_secrets WHERE name = 'push_webhook_url';
  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret';
  IF v_url IS NULL OR v_url = '' THEN
    RETURN NULL;  -- not configured: in-app only, no error
  END IF;

  PERFORM extensions.net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-webhook-secret', COALESCE(v_secret, '')),
    body    := jsonb_build_object('notification_id', NEW.id),
    timeout_milliseconds := 5000
  );
  RETURN NULL;
END; $$;
REVOKE EXECUTE ON FUNCTION public.dispatch_push() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER dispatch_push_trg
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_push();
