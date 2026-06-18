-- 020: Security hardening from Supabase security advisors (2026-06). APPLIED 2026-06.
--
-- (a) Trigger functions must never be RPC-callable. handle_new_user() and
--     handle_updated_at() take zero args yet carried EXECUTE grants to
--     anon/authenticated/PUBLIC, so they were invocable via PostgREST
--     /rest/v1/rpc (lints 0028/0029). Revoke EXECUTE -- they still fire as
--     triggers, which does NOT consult EXECUTE grants. We revoke from PUBLIC too
--     (anon/authenticated inherit EXECUTE through the PUBLIC grant).
REVOKE EXECUTE ON FUNCTION public.handle_new_user()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

-- (b) Pin a non-mutable search_path on the functions flagged by lint 0011
--     (function_search_path_mutable). 'public' matches the unqualified table
--     references in their bodies, so this is behaviour-preserving. (The 4th
--     flagged function, generate_suggestion, was dropped in migration 019.)
ALTER FUNCTION public.get_prompt_cards(uuid, integer) SET search_path = public;
ALTER FUNCTION public.dn_score_one(text[], integer[], integer, text[], text[], text[], text, integer, integer, text[], text[], numeric, text) SET search_path = public;
ALTER FUNCTION public.generate_couple_candidates_v3(uuid, uuid, text[], integer[], text, integer) SET search_path = public;

-- (c) Document the intentional RLS-enabled-no-policy lockdown on auth_rate_limits
--     (lint 0008). The table is only reached via the SECURITY DEFINER
--     check_auth_rate_limit() RPC, so direct client reads/writes are correctly
--     denied. Documenting so the "missing policy" reads as deliberate, not a gap.
COMMENT ON TABLE public.auth_rate_limits IS
  'RLS enabled with NO policies BY DESIGN: only reachable via the SECURITY DEFINER check_auth_rate_limit() RPC. Direct client access is intentionally denied.';

-- NOTE (manual, not SQL): "Leaked password protection" (HaveIBeenPwned check) is
-- disabled in Supabase Auth. It is an Auth dashboard setting, not a DB object, so
-- it cannot be toggled here. Low urgency -- the app uses magic-link auth only. To
-- enable: Supabase Dashboard -> Authentication -> Providers -> Password -> "Leaked
-- password protection".
