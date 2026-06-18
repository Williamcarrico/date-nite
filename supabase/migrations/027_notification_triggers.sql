-- 027: Server-authoritative notification emission via AFTER triggers on the
-- event tables. APPLIED 2026-06. All SECURITY DEFINER, search_path=public, and
-- revoked from anon/authenticated (trigger-only — triggers fire regardless of
-- EXECUTE grants). Each derives recipient(s) and calls create_notification().

-- couple linked: notify partner_a when the couple goes pending -> active.
CREATE OR REPLACE FUNCTION public.notify_couple_linked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name TEXT;
BEGIN
  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    SELECT COALESCE(display_name, 'Your partner') INTO v_name
      FROM public.profiles WHERE id = NEW.partner_b;
    PERFORM public.create_notification(
      NEW.partner_a, 'couple_linked',
      'You''re linked! 💞',
      COALESCE(v_name, 'Your partner') || ' joined you on Date Nite.',
      '/app/play',
      jsonb_build_object('couple_id', NEW.id, 'partner_id', NEW.partner_b));
  END IF;
  RETURN NULL;
END; $$;
REVOKE EXECUTE ON FUNCTION public.notify_couple_linked() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_couple_linked_trg
  AFTER UPDATE OF status ON public.couples
  FOR EACH ROW EXECUTE FUNCTION public.notify_couple_linked();

-- session outcome: match (revealed + real match) and mystery reveal (resolved).
CREATE OR REPLACE FUNCTION public.notify_session_outcome()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_a UUID; v_b UUID;
BEGIN
  SELECT partner_a, partner_b INTO v_a, v_b FROM public.couples WHERE id = NEW.couple_id;

  IF NEW.status = 'revealed' AND OLD.status IS DISTINCT FROM 'revealed'
     AND array_length(NEW.match_idea_ids, 1) >= 1 THEN
    PERFORM public.create_notification(v_a, 'match_found', 'It''s a match! 🎉',
      'You and your partner both liked the same idea.', '/app/play',
      jsonb_build_object('session_id', NEW.id));
    PERFORM public.create_notification(v_b, 'match_found', 'It''s a match! 🎉',
      'You and your partner both liked the same idea.', '/app/play',
      jsonb_build_object('session_id', NEW.id));
  END IF;

  IF NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved' THEN
    PERFORM public.create_notification(v_a, 'mystery_revealed', 'Mystery revealed! 🎁',
      'Your mystery date is now unwrapped.', '/app/play',
      jsonb_build_object('session_id', NEW.id));
    PERFORM public.create_notification(v_b, 'mystery_revealed', 'Mystery revealed! 🎁',
      'Your mystery date is now unwrapped.', '/app/play',
      jsonb_build_object('session_id', NEW.id));
  END IF;
  RETURN NULL;
END; $$;
REVOKE EXECUTE ON FUNCTION public.notify_session_outcome() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_session_outcome_trg
  AFTER UPDATE OF status ON public.date_sessions
  FOR EACH ROW EXECUTE FUNCTION public.notify_session_outcome();

-- mystery created: notify the NON-planner partner.
CREATE OR REPLACE FUNCTION public.notify_mystery_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_couple UUID; v_a UUID; v_b UUID; v_recipient UUID;
BEGIN
  SELECT couple_id INTO v_couple FROM public.date_sessions WHERE id = NEW.session_id;
  SELECT partner_a, partner_b INTO v_a, v_b FROM public.couples WHERE id = v_couple;
  v_recipient := CASE WHEN NEW.planner_id = v_a THEN v_b ELSE v_a END;
  PERFORM public.create_notification(v_recipient, 'mystery_created', 'A mystery awaits 🎁',
    'Your partner planned a surprise date for you.', '/app/play',
    jsonb_build_object('session_id', NEW.session_id));
  RETURN NULL;
END; $$;
REVOKE EXECUTE ON FUNCTION public.notify_mystery_created() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_mystery_created_trg
  AFTER INSERT ON public.mystery_dates
  FOR EACH ROW EXECUTE FUNCTION public.notify_mystery_created();

-- date scheduled: notify the owner. UPDATE-only with a transition guard so the
-- already-'scheduled' rows that reveal_mystery() INSERTs do NOT double-notify
-- (mystery reveal is covered by notify_session_outcome above).
CREATE OR REPLACE FUNCTION public.notify_date_scheduled()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title TEXT;
BEGIN
  IF NEW.status = 'scheduled' AND OLD.status IS DISTINCT FROM 'scheduled' THEN
    SELECT title INTO v_title FROM public.idea_templates WHERE id = NEW.idea_template_id;
    PERFORM public.create_notification(
      NEW.profile_id, 'date_scheduled', 'Date scheduled 🗓️',
      COALESCE(v_title, 'Your date') || ' is on the calendar.',
      '/app/history',
      jsonb_build_object('suggestion_id', NEW.id, 'scheduled_at', NEW.scheduled_at));
  END IF;
  RETURN NULL;
END; $$;
REVOKE EXECUTE ON FUNCTION public.notify_date_scheduled() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_date_scheduled_trg
  AFTER UPDATE OF status ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.notify_date_scheduled();
