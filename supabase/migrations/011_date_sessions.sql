-- =============================================================================
-- Blind Double-Pick sessions.  APPLIED 2026-06.
-- Each partner's picks are PRIVATE (table-level RLS); the overlap is computed
-- only by resolve_session() running elevated, so the "blind" cannot be defeated
-- even via direct API access.
-- =============================================================================

CREATE TABLE IF NOT EXISTS date_sessions (
  id             UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  couple_id      UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by     UUID NOT NULL REFERENCES profiles(id),
  mode           TEXT NOT NULL DEFAULT 'double_pick',
  status         TEXT NOT NULL DEFAULT 'picking' CHECK (status IN ('picking','revealed','resolved','expired')),
  filters        JSONB,
  context        JSONB,
  chosen_idea_id UUID REFERENCES idea_templates(id),
  match_idea_ids UUID[] NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  revealed_at    TIMESTAMPTZ,
  resolved_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS date_sessions_couple ON date_sessions (couple_id, created_at DESC);

CREATE TABLE IF NOT EXISTS session_candidates (
  id               UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id       UUID NOT NULL REFERENCES date_sessions(id) ON DELETE CASCADE,
  idea_template_id UUID NOT NULL REFERENCES idea_templates(id),
  match_score      NUMERIC,
  score_breakdown  JSONB,
  position         INT NOT NULL,
  UNIQUE (session_id, idea_template_id)
);
CREATE INDEX IF NOT EXISTS session_candidates_session ON session_candidates (session_id, position);

CREATE TABLE IF NOT EXISTS session_picks (
  id           UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id   UUID NOT NULL REFERENCES date_sessions(id) ON DELETE CASCADE,
  profile_id   UUID NOT NULL REFERENCES profiles(id),
  candidate_id UUID NOT NULL REFERENCES session_candidates(id) ON DELETE CASCADE,
  liked        BOOLEAN NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, profile_id, candidate_id)
);

CREATE OR REPLACE FUNCTION is_couple_member(p_couple_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM couples
    WHERE id = p_couple_id AND (partner_a = auth.uid() OR partner_b = auth.uid())
  );
$$;

ALTER TABLE date_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_picks      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members select sessions" ON date_sessions
  FOR SELECT USING (is_couple_member(couple_id));
CREATE POLICY "members insert sessions" ON date_sessions
  FOR INSERT WITH CHECK (created_by = auth.uid() AND is_couple_member(couple_id));
CREATE POLICY "members update sessions" ON date_sessions
  FOR UPDATE USING (is_couple_member(couple_id));
CREATE POLICY "members delete sessions" ON date_sessions
  FOR DELETE USING (is_couple_member(couple_id));

CREATE POLICY "members select candidates" ON session_candidates
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM date_sessions ds WHERE ds.id = session_id AND is_couple_member(ds.couple_id)
  ));
CREATE POLICY "members insert candidates" ON session_candidates
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM date_sessions ds WHERE ds.id = session_id AND is_couple_member(ds.couple_id)
  ));

-- session_picks: a user can read/write ONLY their own picks (this is the blind).
CREATE POLICY "own picks select" ON session_picks
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "own picks insert" ON session_picks
  FOR INSERT WITH CHECK (profile_id = auth.uid() AND EXISTS (
    SELECT 1 FROM date_sessions ds WHERE ds.id = session_id AND is_couple_member(ds.couple_id)
  ));
CREATE POLICY "own picks update" ON session_picks
  FOR UPDATE USING (profile_id = auth.uid());

CREATE OR REPLACE FUNCTION get_session_state(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session date_sessions%ROWTYPE;
  v_uid     UUID := auth.uid();
  v_partner UUID;
  v_count   INT;
  v_mine    INT;
  v_theirs  INT;
BEGIN
  SELECT * INTO v_session FROM date_sessions WHERE id = p_session_id;
  IF NOT FOUND OR NOT is_couple_member(v_session.couple_id) THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  SELECT CASE WHEN partner_a = v_uid THEN partner_b ELSE partner_a END
    INTO v_partner FROM couples WHERE id = v_session.couple_id;

  SELECT count(*) INTO v_count FROM session_candidates WHERE session_id = p_session_id;
  SELECT count(*) INTO v_mine   FROM session_picks WHERE session_id = p_session_id AND profile_id = v_uid;
  SELECT count(*) INTO v_theirs FROM session_picks WHERE session_id = p_session_id AND profile_id = v_partner;

  RETURN jsonb_build_object(
    'status', v_session.status,
    'candidate_count', v_count,
    'my_picks', v_mine,
    'partner_picks', v_theirs,
    'my_done', v_count > 0 AND v_mine >= v_count,
    'partner_done', v_count > 0 AND v_theirs >= v_count,
    'match_idea_ids', v_session.match_idea_ids,
    'chosen_idea_id', v_session.chosen_idea_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION resolve_session(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session date_sessions%ROWTYPE;
  v_count   INT;
  v_done    INT;
  v_matches UUID[];
BEGIN
  SELECT * INTO v_session FROM date_sessions WHERE id = p_session_id FOR UPDATE;
  IF NOT FOUND OR NOT is_couple_member(v_session.couple_id) THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  IF v_session.status = 'picking' THEN
    SELECT count(*) INTO v_count FROM session_candidates WHERE session_id = p_session_id;
    SELECT count(*) INTO v_done FROM (
      SELECT profile_id FROM session_picks WHERE session_id = p_session_id
      GROUP BY profile_id HAVING count(*) >= v_count
    ) d;

    IF v_count > 0 AND v_done >= 2 THEN
      SELECT array_agg(sc.idea_template_id ORDER BY sc.match_score DESC NULLS LAST)
        INTO v_matches
      FROM session_candidates sc
      WHERE sc.session_id = p_session_id
        AND (SELECT count(DISTINCT sp.profile_id) FROM session_picks sp
             WHERE sp.candidate_id = sc.id AND sp.liked = TRUE) >= 2;

      UPDATE date_sessions
        SET status = 'revealed',
            match_idea_ids = COALESCE(v_matches, '{}'),
            revealed_at = now()
        WHERE id = p_session_id;
    END IF;
  END IF;

  RETURN get_session_state(p_session_id);
END;
$$;

COMMENT ON FUNCTION resolve_session IS 'Date Nite: reveals mutual likes once both partners finish the deck. Idempotent.';
</content>
