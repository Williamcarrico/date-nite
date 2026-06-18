-- 021: Performance hardening from Supabase performance advisors (2026-06). APPLIED 2026-06.

-- (a) Covering indexes for the 11 unindexed foreign keys (lint 0001). Without
--     these, FK lookups + cascade checks do sequential scans, and the joins in
--     hot paths (completed_dates.suggestion_id, session_picks.*) are unindexed.
CREATE INDEX IF NOT EXISTS idx_completed_dates_suggestion_id      ON public.completed_dates(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_date_sessions_chosen_idea_id       ON public.date_sessions(chosen_idea_id);
CREATE INDEX IF NOT EXISTS idx_date_sessions_created_by           ON public.date_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_exclusions_idea_template_id        ON public.exclusions(idea_template_id);
CREATE INDEX IF NOT EXISTS idx_favorites_idea_template_id         ON public.favorites(idea_template_id);
CREATE INDEX IF NOT EXISTS idx_mystery_dates_idea_template_id     ON public.mystery_dates(idea_template_id);
CREATE INDEX IF NOT EXISTS idx_mystery_dates_planner_id           ON public.mystery_dates(planner_id);
CREATE INDEX IF NOT EXISTS idx_session_candidates_idea_template_id ON public.session_candidates(idea_template_id);
CREATE INDEX IF NOT EXISTS idx_session_picks_candidate_id         ON public.session_picks(candidate_id);
CREATE INDEX IF NOT EXISTS idx_session_picks_profile_id           ON public.session_picks(profile_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_idea_template_id       ON public.suggestions(idea_template_id);

-- (b) Drop duplicate unique indexes (lint 0009). The auto-named *_key UNIQUE
--     CONSTRAINTS on (profile_id, idea_template_id) already enforce uniqueness;
--     the *_uniq indexes added in migration 008 are exact redundant duplicates.
--     (We drop the plain indexes, keeping the constraint-backed ones.)
DROP INDEX IF EXISTS public.exclusions_profile_idea_uniq;
DROP INDEX IF EXISTS public.favorites_profile_idea_uniq;

-- (c) Rewrite RLS policies so auth.uid() is evaluated ONCE per query (scalar
--     subquery) instead of once per row (lint 0003 auth_rls_initplan). Semantics
--     are identical -- (select auth.uid()) returns the same value as auth.uid();
--     only the planner placement changes. The session_picks blindness guarantee
--     (a partner cannot read the other's picks) is preserved exactly.

-- couples
DROP POLICY IF EXISTS "Members can delete their couple" ON public.couples;
CREATE POLICY "Members can delete their couple" ON public.couples
  FOR DELETE TO public
  USING (((select auth.uid()) = partner_a) OR ((select auth.uid()) = partner_b));

DROP POLICY IF EXISTS "Members can view their couple" ON public.couples;
CREATE POLICY "Members can view their couple" ON public.couples
  FOR SELECT TO public
  USING (((select auth.uid()) = partner_a) OR ((select auth.uid()) = partner_b));

DROP POLICY IF EXISTS "Users can create a couple they own" ON public.couples;
CREATE POLICY "Users can create a couple they own" ON public.couples
  FOR INSERT TO public
  WITH CHECK ((select auth.uid()) = partner_a);

-- date_sessions (only the INSERT policy calls auth.uid() directly; the others use
-- is_couple_member(couple_id), which takes a row column and isn't hoistable)
DROP POLICY IF EXISTS "members insert sessions" ON public.date_sessions;
CREATE POLICY "members insert sessions" ON public.date_sessions
  FOR INSERT TO public
  WITH CHECK ((created_by = (select auth.uid())) AND is_couple_member(couple_id));

-- session_picks
DROP POLICY IF EXISTS "own picks insert" ON public.session_picks;
CREATE POLICY "own picks insert" ON public.session_picks
  FOR INSERT TO public
  WITH CHECK ((profile_id = (select auth.uid())) AND (EXISTS (
    SELECT 1 FROM date_sessions ds
    WHERE ds.id = session_picks.session_id AND is_couple_member(ds.couple_id))));

DROP POLICY IF EXISTS "own picks select" ON public.session_picks;
CREATE POLICY "own picks select" ON public.session_picks
  FOR SELECT TO public
  USING (profile_id = (select auth.uid()));

DROP POLICY IF EXISTS "own picks update" ON public.session_picks;
CREATE POLICY "own picks update" ON public.session_picks
  FOR UPDATE TO public
  USING (profile_id = (select auth.uid()));

-- mystery_dates
DROP POLICY IF EXISTS "planner manages mystery" ON public.mystery_dates;
CREATE POLICY "planner manages mystery" ON public.mystery_dates
  FOR ALL TO public
  USING (planner_id = (select auth.uid()))
  WITH CHECK (planner_id = (select auth.uid()));
