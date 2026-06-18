-- 029: Upcoming-date reminders via pg_cron. APPLIED 2026-06. Hourly job creates a
-- 'date_reminder' notification for each scheduled suggestion whose date is within
-- the next 24h and hasn't been reminded. reminded_at + FOR UPDATE SKIP LOCKED make
-- it idempotent and overlap-safe. Each partner has their own suggestion row, so
-- both are reminded with no couple lookup.
ALTER TABLE public.suggestions ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMPTZ;

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.enqueue_due_date_reminders()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_count INT := 0;
BEGIN
  FOR r IN
    SELECT s.id, s.profile_id, s.scheduled_at, it.title
    FROM public.suggestions s
    JOIN public.idea_templates it ON it.id = s.idea_template_id
    WHERE s.status = 'scheduled'
      AND s.reminded_at IS NULL
      AND s.scheduled_at IS NOT NULL
      AND s.scheduled_at >  now()
      AND s.scheduled_at <= now() + INTERVAL '24 hours'
    FOR UPDATE OF s SKIP LOCKED
  LOOP
    PERFORM public.create_notification(
      r.profile_id, 'date_reminder', 'Date coming up ⏰',
      COALESCE(r.title, 'Your date') || ' is within 24 hours.',
      '/app/history',
      jsonb_build_object('suggestion_id', r.id, 'scheduled_at', r.scheduled_at));
    UPDATE public.suggestions SET reminded_at = now() WHERE id = r.id;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END; $$;
REVOKE EXECUTE ON FUNCTION public.enqueue_due_date_reminders() FROM PUBLIC, anon, authenticated;

-- Hourly. Idempotent via reminded_at; overlap-safe via SKIP LOCKED.
SELECT cron.schedule('date-reminders-hourly', '0 * * * *',
  $$ SELECT public.enqueue_due_date_reminders(); $$);
