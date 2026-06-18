-- Mystery Date fixes (post-review).  APPLIED 2026-06.
-- get_mystery_view must NOT be the sole arbiter of "revealed": revealing has to
-- go through reveal_mystery() so status/chosen_idea_id/exclusions/suggestions are
-- committed exactly once. Remove the time-based auto-reveal clause and the unused
-- reveal_at column. (A future scheduled reveal should be driven by a pg_cron job
-- that calls reveal_mystery(), not by this read-only view.)
--
-- NOTE: reveal_mystery's INSERT INTO suggestions has no ON CONFLICT and the
-- suggestions table intentionally has NO unique(profile_id, idea_template_id)
-- (a user can legitimately be suggested the same idea more than once over time).
-- Its idempotency therefore relies on the `IF NOT v_m.revealed` guard executing
-- under the `SELECT ... FOR UPDATE` lock on date_sessions — that insert MUST stay
-- inside that guarded block.

CREATE OR REPLACE FUNCTION get_mystery_view(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sess       date_sessions%ROWTYPE;
  v_m          mystery_dates%ROWTYPE;
  v_idea       idea_templates%ROWTYPE;
  v_uid        UUID := auth.uid();
  v_is_planner BOOLEAN;
  v_revealed   BOOLEAN;
  v_base       JSONB;
BEGIN
  SELECT * INTO v_sess FROM date_sessions WHERE id = p_session_id;
  IF NOT FOUND OR NOT is_couple_member(v_sess.couple_id) THEN
    RAISE EXCEPTION 'Mystery not found';
  END IF;
  SELECT * INTO v_m FROM mystery_dates WHERE session_id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mystery not found'; END IF;
  SELECT * INTO v_idea FROM idea_templates WHERE id = v_m.idea_template_id;

  v_is_planner := (v_uid = v_m.planner_id);
  v_revealed := v_m.revealed;  -- gated solely on the committed column

  v_base := jsonb_build_object(
    'is_planner', v_is_planner,
    'revealed', v_revealed,
    'status', v_sess.status,
    'scheduled_at', v_m.scheduled_at,
    'dress_code', v_m.dress_code,
    'cost_level', v_idea.cost_level,
    'intensity_level', v_idea.intensity_level,
    'duration_minutes', v_idea.duration_minutes,
    'requires_reservation', v_idea.requires_reservation
  );

  IF v_is_planner OR v_revealed THEN
    RETURN v_base || jsonb_build_object(
      'idea_template_id', v_idea.id,
      'title', v_idea.title,
      'description', v_idea.description,
      'category', v_idea.category,
      'vibe_tags', v_idea.vibe_tags,
      'setting_type', v_idea.setting_type,
      'estimated_cost_min', v_idea.estimated_cost_min,
      'estimated_cost_max', v_idea.estimated_cost_max,
      'search_keywords', v_idea.search_keywords,
      'venue_type', v_idea.venue_type,
      'reservation_platforms', v_idea.reservation_platforms
    );
  END IF;

  RETURN v_base;
END;
$$;

ALTER TABLE mystery_dates DROP COLUMN IF EXISTS reveal_at;
