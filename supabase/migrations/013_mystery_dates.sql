-- =============================================================================
-- Mystery Date mode.  APPLIED 2026-06.
-- The planner secretly picks (and optionally schedules) a date; the partner sees
-- ONLY a teaser (cost/intensity/duration/dress/time) until reveal. The secret
-- lives in a planner-only table; the partner reads it exclusively through
-- get_mystery_view() (SECURITY DEFINER), so the surprise cannot be spoiled via
-- direct API access.
-- =============================================================================

CREATE TABLE IF NOT EXISTS mystery_dates (
  session_id       UUID PRIMARY KEY REFERENCES date_sessions(id) ON DELETE CASCADE,
  planner_id       UUID NOT NULL REFERENCES profiles(id),
  idea_template_id UUID NOT NULL REFERENCES idea_templates(id),
  scheduled_at     TIMESTAMPTZ,
  dress_code       TEXT,
  revealed         BOOLEAN NOT NULL DEFAULT FALSE,
  reveal_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE mystery_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner manages mystery" ON mystery_dates
  FOR ALL USING (planner_id = auth.uid()) WITH CHECK (planner_id = auth.uid());

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
  v_revealed := v_m.revealed OR (v_m.reveal_at IS NOT NULL AND now() >= v_m.reveal_at);

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

  RETURN v_base; -- partner, pre-reveal: teaser only
END;
$$;

CREATE OR REPLACE FUNCTION reveal_mystery(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sess date_sessions%ROWTYPE;
  v_m    mystery_dates%ROWTYPE;
  v_a    UUID;
  v_b    UUID;
  v_excl TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_sess FROM date_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR NOT is_couple_member(v_sess.couple_id) THEN
    RAISE EXCEPTION 'Mystery not found';
  END IF;
  SELECT * INTO v_m FROM mystery_dates WHERE session_id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mystery not found'; END IF;

  IF NOT v_m.revealed THEN
    UPDATE mystery_dates SET revealed = TRUE WHERE session_id = p_session_id;
    UPDATE date_sessions
      SET status = 'resolved', chosen_idea_id = v_m.idea_template_id, resolved_at = now()
      WHERE id = p_session_id;

    SELECT partner_a, partner_b INTO v_a, v_b FROM couples WHERE id = v_sess.couple_id;
    v_excl := COALESCE(v_m.scheduled_at, now()) + INTERVAL '90 days';

    INSERT INTO exclusions (profile_id, idea_template_id, excluded_until)
      SELECT pid, v_m.idea_template_id, v_excl
      FROM (VALUES (v_a), (v_b)) AS t(pid)
      WHERE pid IS NOT NULL
      ON CONFLICT (profile_id, idea_template_id) DO UPDATE SET excluded_until = EXCLUDED.excluded_until;

    INSERT INTO suggestions (profile_id, idea_template_id, status, scheduled_at)
      SELECT pid, v_m.idea_template_id,
             CASE WHEN v_m.scheduled_at IS NOT NULL THEN 'scheduled' ELSE 'suggested' END,
             v_m.scheduled_at
      FROM (VALUES (v_a), (v_b)) AS t(pid)
      WHERE pid IS NOT NULL;
  END IF;

  RETURN get_mystery_view(p_session_id);
END;
$$;

COMMENT ON FUNCTION get_mystery_view IS 'Date Nite: full details to planner/after reveal, teaser-only to partner before reveal.';
COMMENT ON FUNCTION reveal_mystery IS 'Date Nite: reveals a mystery date, commits it for both partners. Idempotent.';
