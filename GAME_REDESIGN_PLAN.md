# Date Nite → "The Match": Two-Player Game Redesign Plan

**Goal:** Convert Date Nite from a single-player recommendation form into a genuine couples *game*, built on the existing preference-learning scorer. Centerpiece mechanic: **Blind Double-Pick ("It's a Match!")** with a **spin-the-wheel reveal**, plus a real **couple/partner model**. Solo mode is retained as a fallback.

> This plan also *folds in* the prerequisite engine fixes (deterministic reroll, un-normalized score, RPC set-vs-single, exclusions never written), because the game's "return top N candidates" path is the natural place to fix them.

---

## 1. Product flow (target experience)

```
Link partner (one-time)  →  Start a Round  →  Shared hand of N ideas
        │                                            │
        │                         each partner privately swipes/picks (BLIND)
        │                                            │
        └──────────────  both done  →  resolve_session()  ──────────────┐
                                                                         ▼
                              0 overlaps → tiebreaker round      ≥1 overlap → SPIN REVEAL
                                                                         │
                                                          "It's a Match!" + confetti
                                                                         │
                                                   Schedule it → exclude for both (90d)
```

- **Same-room play:** both phones live; Supabase Realtime drives a synced reveal.
- **Async play:** partner A starts a round and picks; partner B is notified, picks later; reveal fires when the second partner finishes.

---

## 2. Decisions & assumptions (defaults chosen — confirm if you disagree)

| Decision | Default | Rationale |
|---|---|---|
| Solo mode | **Keep it** (fixed `generate_suggestion_v2`) | Single users and "just give me one idea" still valid. |
| Partner linking | **Invite code** (short, shareable) + optional email | No social graph needed; works cross-device instantly. |
| Couple size | **Exactly 2** | The whole domain. Enforced by schema. |
| Sync | **Both** same-room (Realtime) **and** async (notification) | Realtime is an enhancement, not a requirement. |
| Blindness enforcement | **Server-side** via `SECURITY DEFINER` resolve fn | Clients never read the other partner's picks pre-reveal. |
| Hand size N | **5** candidates | Enough choice, short enough to finish. |
| Compatibility score | **Harmonic mean** of each partner's normalized score | Penalizes ideas one partner dislikes — favors mutual appeal. |

---

## 3. Data model (new migrations)

> Prerequisite: commit a **`000_initial_schema.sql`** base migration first (the six core tables — `profiles`, `idea_templates`, `suggestions`, `favorites`, `completed_dates`, `exclusions` — currently exist only in the live DB). Generate via `supabase db dump --schema public`, then the new tables below go in `007_couples.sql` / `008_date_sessions.sql`.

### `couples`
```sql
create table couples (
  id          uuid primary key default gen_random_uuid(),
  partner_a   uuid not null references profiles(id) on delete cascade,
  partner_b   uuid references profiles(id) on delete set null,  -- null until accepted
  invite_code text unique not null,            -- e.g. 6-char base32
  status      text not null default 'pending', -- pending | active
  created_at  timestamptz not null default now(),
  constraint distinct_partners check (partner_b is null or partner_a <> partner_b)
);
create unique index one_active_couple_per_user_a on couples(partner_a) where status = 'active';
```

### `date_sessions` (one Blind Double-Pick round)
```sql
create table date_sessions (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references couples(id) on delete cascade,
  created_by    uuid not null references profiles(id),
  mode          text not null default 'double_pick', -- double_pick | mystery | wheel (future)
  status        text not null default 'picking',     -- picking | revealed | resolved | expired
  filters       jsonb,            -- setting/intensity used
  context       jsonb,            -- {season, dayOfWeek, timeOfDay}
  chosen_idea_id uuid references idea_templates(id),
  match_idea_ids uuid[],          -- overlap result written by resolve_session()
  created_at    timestamptz not null default now(),
  revealed_at   timestamptz,
  resolved_at   timestamptz
);
```

### `session_candidates` (the shared hand of N)
```sql
create table session_candidates (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references date_sessions(id) on delete cascade,
  idea_template_id uuid not null references idea_templates(id),
  match_score      numeric,    -- normalized 0-100 compatibility
  score_breakdown  jsonb,
  position         int not null,
  unique(session_id, idea_template_id)
);
```

### `session_picks` (each partner's private picks — the "blind" data)
```sql
create table session_picks (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references date_sessions(id) on delete cascade,
  profile_id   uuid not null references profiles(id),
  candidate_id uuid not null references session_candidates(id) on delete cascade,
  liked        boolean not null,
  created_at   timestamptz not null default now(),
  unique(session_id, profile_id, candidate_id)
);
```

### RLS (critical — enforces blindness)
- `couples`: member (`partner_a` or `partner_b`) can `select`; `partner_a` can `insert`; either can `update` (for accept).
- `date_sessions` / `session_candidates`: readable by either couple member.
- **`session_picks`: a user may `select`/`insert` only `where profile_id = auth.uid()`.** They can **never** read the partner's picks. The overlap is computed only by `resolve_session()` (SECURITY DEFINER) and written to `date_sessions.match_idea_ids`. This makes the blind mechanic tamper-proof even against direct API calls.

---

## 4. Scorer changes (fixes 3 critical bugs at once)

New function **`generate_couple_candidates_v3`** — a refactor of `generate_suggestion_v2`:

```sql
generate_couple_candidates_v3(
  p_profile_a uuid,
  p_profile_b uuid default null,   -- null => solo mode
  p_setting_types text[] default null,
  p_intensity_levels int[] default null,
  p_current_season text, p_day_of_week int, p_time_of_day text,
  p_limit int default 5
) returns table (idea_id uuid, idea_data jsonb, match_score numeric, score_breakdown jsonb)
```

Changes vs. v2:
1. **Returns top N (`LIMIT p_limit`)**, not 1 → fixes deterministic reroll *and* feeds the hand.
2. **Score over the full active set before LIMIT** (current v2 applies `LIMIT 100` *before* scoring, dropping ~16 ideas unscored). Use a set-based scoring CTE + `ORDER BY score DESC` last.
3. **Normalize to 0–100:** `match_score := LEAST(100, GREATEST(0, ROUND(raw_score / 320.0 * 100)))` (320 ≈ theoretical max). Fixes the "304%" display everywhere.
4. **Two-partner blend:** compute each partner's score from their own `user_preference_weights`, combine with **harmonic mean** `2ab/(a+b)` (mutual appeal). Solo mode = single score.
5. **Exclude ideas in *either* partner's `exclusions`.**

Server-action side: read the RPC result as an **array** (it's a set — add `.maybeSingle()` only where you truly want one row). This closes the set-vs-single bug.

---

## 5. Server actions (`lib/actions/`)

New `lib/actions/couples.ts`:
- `createCoupleInvite()` → creates `couples` row (pending) + returns `invite_code`.
- `acceptInvite(code)` → sets `partner_b = auth.uid()`, `status='active'`; rejects self-join / already-coupled.
- `getCouple()` → current user's active couple (+ partner profile).
- `unlinkCouple()`.

New `lib/actions/sessions.ts`:
- `startRound({ filters, context })` → calls `generate_couple_candidates_v3`, creates `date_sessions` + N `session_candidates`; returns session + hand. (Realtime listeners on both devices pick it up.)
- `submitPick(sessionId, candidateId, liked)` → upsert into `session_picks`.
- `finishPicking(sessionId)` → marks this partner done; if both done, calls `resolve_session(sessionId)`.
- `resolveSession(sessionId)` (RPC, SECURITY DEFINER) → computes overlap, writes `match_idea_ids`, flips `status='revealed'`. **Returns only the overlap**, never raw picks.
- `chooseMatch(sessionId, ideaId)` → sets `chosen_idea_id`, `status='resolved'`, creates a `suggestions` row, and **writes a 90-day `exclusions` row for BOTH partners** (this is the missing exclusion write — fixes the no-repeat guarantee).

Modify existing `generateSuggestion` (solo) to call v3 with `p_profile_b = null` and read the normalized score.

---

## 6. Realtime sync

- Client subscribes via `supabase.channel('session:'+id)` to `postgres_changes` on `date_sessions` (status flips) and a count of `session_picks` for progress ("Partner picked 3/5…").
- On `status → 'revealed'`, both clients trigger the spin reveal simultaneously.
- Async fallback: if partner offline, fire a notification (wire the existing `notification-bell` to a real `notifications` table, or send email) so they return to finish.

---

## 7. UI / components

New route: **`app/(app)/play/page.tsx`** (also collapse the dead `(marketing)` group → `(app)`; see polish fixes).

- **`<PartnerLink/>`** — invite-code generate/share + accept (empty state when no couple).
- **`<RoundLobby/>`** — "Start a Round" with the existing filter UI reused from `randomize/page.tsx`.
- **`<PickDeck/>`** — swipe/tap through the N candidates (Tinder-style cards via `motion`); shows "waiting for partner" after finishing.
- **`<MatchReveal/>`** — the **spin-the-wheel** animation cycling candidate titles/emojis, landing on the match, then **`animate-confetti`** (the keyframe already exists in `globals.css` but is currently unused) + `PartyPopper`. On 0 overlap → "No match — go again?" tiebreaker.
- **`<MatchResult/>`** — reuse the existing rich suggestion card (schedule, ICS, reservation links) from `randomize/page.tsx`.

Keep solo `randomize` page; add a toggle "Play solo / Play together" when a couple exists.

---

## 8. Build sequence

**Phase 0 — Foundation & bug fixes (prerequisite, ~1 day)**
1. Commit `000_initial_schema.sql` (dump live DB) so the repo is reproducible.
2. Regenerate `types/database.ts` (`supabase gen types`); remove the `as any`/`as never` casts.
3. Ship `generate_couple_candidates_v3` with normalization + return-N + exclude-both; repoint solo `generateSuggestion` to it; read result as array.
4. Write exclusions on resolve/schedule. → *Solo reroll + score display now correct.*

**Phase 1 — Couple model (~1 day)**
5. `007_couples.sql` + RLS; `lib/actions/couples.ts`; `<PartnerLink/>` + accept flow.

**Phase 2 — Blind Double-Pick (~2–3 days)**
6. `008_date_sessions.sql` + RLS (private picks) + `resolve_session()` SECURITY DEFINER.
7. `lib/actions/sessions.ts`; `<RoundLobby/>` + `<PickDeck/>`.
8. Realtime subscription + progress UI.

**Phase 3 — The reveal (~1 day)**
9. `<MatchReveal/>` spin animation + confetti; tiebreaker path; wire `<MatchResult/>` to schedule/exclude.

**Phase 4 — Game depth (later, optional)**
10. Couple streaks/milestones/badges on Insights (read-only over `completed_dates`).
11. Conversation/dare card decks (`conversation_prompts[]`, `dares[]` on `idea_templates`, keyed to `vibe_tags`).
12. Mystery Date mode (reuse `date_sessions.mode`).

---

## 9. Testing & risks

- **Blindness:** test that partner B's picks are unreadable by A via direct PostgREST call before reveal (RLS + SECURITY DEFINER).
- **Race:** two partners finishing simultaneously must resolve once (idempotent `resolve_session`, guard on `status`).
- **Async expiry:** a `picking` session older than e.g. 24h → `expired`; don't leave dangling rounds.
- **Score normalization:** verify no displayed % > 100 and harmonic mean handles a 0 from one partner gracefully (`min` floor).
- **Catalog depth risk:** N=5 hands + exclude-both shrinks the pool faster for a couple than for a solo user. Pair this with content expansion (luxury tier currently = 1 idea, "Full Send" = 2).

---

## 10. Why this hits all four goals

- **Optimized:** reproducible schema, normalized scoring, set-based candidate query, exclusions finally working.
- **Modern:** Supabase Realtime, SECURITY DEFINER RLS, server actions, `motion` reveal — current patterns.
- **Sophisticated:** two-partner preference blending via harmonic mean on top of the existing multi-dimensional learner.
- **Creative:** a genuine shared, anticipation-driven game ("It's a Match!") that matches what 2026 market leaders (Cupla, Paired, Desire) actually ship — which today's single-player form does not.
</content>
</invoke>
