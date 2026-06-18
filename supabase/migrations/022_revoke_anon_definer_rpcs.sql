-- 022: Defence-in-depth — stop logged-out (anon) users from probing the
-- authenticated-only SECURITY DEFINER RPCs (security advisor lint 0028). APPLIED 2026-06.
--
-- These 7 functions all internally gate on auth.uid()/is_couple_member(), so a
-- direct anon call already fails or returns nothing — but they are only ever
-- invoked by signed-in /app server actions, so anon has no business calling them
-- at all. Revoking PUBLIC + anon (authenticated keeps its OWN explicit EXECUTE
-- grant, so the app is unaffected) removes the anon attack surface.
--
-- Deliberately NOT revoked:
--   * check_auth_rate_limit  -- called PRE-login (the caller is anon), required.
--   * is_couple_member       -- used inside RLS policies on date_sessions/
--                               session_picks; authenticated needs EXECUTE for
--                               policy evaluation. Left fully intact.
-- The remaining 0029 (authenticated-executable) warnings are expected: these
-- functions MUST be callable by signed-in users and validate ownership internally.

REVOKE EXECUTE ON FUNCTION public.accept_couple_invite(text)    FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_active_exclusions(uuid)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_mystery_view(uuid)        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_profile_stats(uuid)       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_session_state(uuid)       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.resolve_session(uuid)         FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reveal_mystery(uuid)          FROM PUBLIC, anon;
