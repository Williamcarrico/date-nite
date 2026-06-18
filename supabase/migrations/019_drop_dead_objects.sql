-- 019: Drop dead DB objects surfaced by the completeness audit (2026-06).
-- APPLIED 2026-06.
--
-- 1. public.venues: empty (0 rows), referenced by no application code and by NO
--    migration in version control (its CREATE TABLE was never committed, so the
--    schema wasn't reproducible). It was a planned external-venue-enrichment
--    feature (google_place_id/yelp_id/opentable_id/resy_id/reservation_url) that
--    was never wired up. NOTE: idea_templates.venue_type is a SEPARATE column and
--    is still used by the scorer/UI -- only the venues TABLE is dropped here.
--
-- 2. idea_templates.outdoor_only: written by the seed (and migration 015) and
--    present on ~97 rows, but read by NO scorer/filter/UI. Its sibling columns
--    seasonal + dietary_friendly ARE consumed by dn_score_one; outdoor_only was
--    the lone unused boolean.
--
-- 3. generate_suggestion(uuid, integer): the superseded v1 scorer. The app uses
--    generate_couple_candidates_v3 exclusively (0 callers of generate_suggestion).
--    It is SECURITY DEFINER, anon/authenticated-EXECUTE-able, and performs NO
--    auth.uid() validation on p_profile_id -- so any caller could create
--    suggestion rows + 90-day exclusions in ANOTHER user's account via
--    /rest/v1/rpc (an IDOR/data-pollution vector). Every other SECURITY DEFINER
--    RPC gates on auth.uid()/is_couple_member(); this orphan did not. Dropping it
--    removes the vector, the dead code, AND its mutable-search_path lint.

DROP FUNCTION IF EXISTS public.generate_suggestion(uuid, integer);

ALTER TABLE public.idea_templates DROP COLUMN IF EXISTS outdoor_only;

DROP TABLE IF EXISTS public.venues;
