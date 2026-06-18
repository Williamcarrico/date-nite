-- 023: Scoring v4 — fix "match quality always 76%". APPLIED 2026-06.
--
-- ROOT CAUSE (v3, migrations 007/018): an additive weighted average where every
-- PREFERENCE-dependent term returned a flat neutral CONSTANT when the preference
-- was empty (vibe 0.6, category 0.6, dietary 1.0, quality 0.6 with no ratings),
-- and the two "objective" terms saturated at 1.0 for most of the catalog. With the
-- live profiles (empty vibe/category/dietary, cost_levels {1,2,3}, no ratings) every
-- cost-1..3 non-seasonal idea scored 100*(0.35*0.6+0.10*0.6+0.15*1+0.10*1+0.15*1+
-- 0.15*0.6)=76.0 — identical for the bulk of 233 ideas.
--
-- FIX: dynamic weight RENORMALIZATION. dn_score_v4 returns JSONB {total + per-signal
-- components}; total = SUM(active w_i * s_i) / SUM(active w_i). Gated terms (vibe,
-- category, dietary, intensity) count ONLY when the user set that preference; their
-- weight redistributes onto the always-on objective terms (smooth cost-fit gradient,
-- 3-tier seasonal, Bayesian-rating + log-popularity quality prior). An empty-pref
-- user is scored purely on signals that genuinely vary per idea, so the score spreads
-- (~38..82 for the current profiles) instead of collapsing to a constant.
--
-- Bounded 0..100 by construction (each s_i in [0,1]; total = weighted avg in [0,1];
-- harmonic mean of two [0,1] values in [0,1]). Adds profiles.preferred_intensity_levels
-- (a real matching preference, gated like the others). STABLE/IMMUTABLE, SECURITY
-- INVOKER, SET search_path=public preserved; idea_data/score_breakdown contract kept
-- (score_breakdown gains 'signals_a' for the "why this match" UI).

-- 1. New profile preference: preferred energy/intensity levels (1..4), read directly
--    by the scorer (like vibe_tags/cost_levels). Empty by default => term inactive.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_intensity_levels INT[] DEFAULT '{}'::int[];

-- 2. Per-idea score components (JSONB) with dynamic renormalization.
DROP FUNCTION IF EXISTS public.dn_score_one(TEXT[],INT[],INT,TEXT[],TEXT[],TEXT[],TEXT,INT,INT,TEXT[],TEXT[],NUMERIC,TEXT);

CREATE OR REPLACE FUNCTION public.dn_score_v4(
  -- profile preferences
  p_vibe_tags           TEXT[],
  p_cost_levels         INT[],
  p_budget_max          INT,
  p_dietary             TEXT[],
  p_favorite_categories TEXT[],
  p_pref_intensity      INT[],
  -- idea attributes
  i_vibe_tags           TEXT[],
  i_category            TEXT,
  i_cost_level          INT,
  i_cost_min            INT,
  i_intensity           INT,
  i_dietary_friendly    TEXT[],
  i_seasonal            TEXT[],
  -- idea desirability inputs
  i_avg_rating          NUMERIC,
  i_rating_n            INT,
  i_fav_n               INT,
  i_comp_n              INT,
  i_sugg_n              INT,
  -- context
  p_current_season      TEXT
) RETURNS JSONB
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  WITH flags AS (
    SELECT
      (COALESCE(array_length(p_vibe_tags,1),0)           > 0) AS has_vibe,
      (COALESCE(array_length(p_favorite_categories,1),0) > 0) AS has_cat,
      (COALESCE(array_length(p_dietary,1),0)             > 0) AS has_diet,
      (COALESCE(array_length(p_pref_intensity,1),0)      > 0) AS has_intensity
  ),
  s AS (
    SELECT
      -- vibe (gated): smooth overlap fraction with a floor
      CASE WHEN f.has_vibe THEN
        LEAST(1.0, 0.35 + 0.65 * (
          COALESCE(cardinality(ARRAY(
            SELECT UNNEST(i_vibe_tags) INTERSECT SELECT UNNEST(p_vibe_tags)
          )),0)::NUMERIC / array_length(p_vibe_tags,1)
        ))
      END AS s_vibe,
      -- category (gated)
      CASE WHEN f.has_cat THEN
        CASE WHEN i_category = ANY(p_favorite_categories) THEN 1.0 ELSE 0.4 END
      END AS s_cat,
      -- dietary (gated)
      CASE WHEN f.has_diet THEN
        CASE WHEN i_dietary_friendly && p_dietary THEN 1.0 ELSE 0.5 END
      END AS s_diet,
      -- intensity (gated): exact match 1.0, else smooth decay by level distance
      CASE WHEN f.has_intensity THEN
        CASE WHEN i_intensity = ANY(p_pref_intensity) THEN 1.0
             ELSE GREATEST(0.0, 1 - 0.34 * (
               SELECT MIN(ABS(COALESCE(i_intensity,2) - k)) FROM UNNEST(p_pref_intensity) AS k))
        END
      END AS s_intensity,
      -- cost (always): smooth level-distance blended with smooth budget overshoot
      ( 0.5 * CASE
                WHEN COALESCE(array_length(p_cost_levels,1),0) = 0 THEN 0.7
                ELSE GREATEST(0.0, 1 - 0.34 * (
                       SELECT MIN(ABS(i_cost_level - cl)) FROM UNNEST(p_cost_levels) AS cl))
              END
      + 0.5 * CASE
                WHEN i_cost_min IS NULL OR p_budget_max IS NULL OR p_budget_max <= 0 THEN 1.0
                WHEN i_cost_min <= p_budget_max THEN 1.0
                ELSE GREATEST(0.0, 1 - (i_cost_min - p_budget_max)::NUMERIC / p_budget_max)
              END
      ) AS s_cost,
      -- seasonal (always): three smooth tiers (in-season / evergreen / off-season)
      CASE
        WHEN p_current_season IS NOT NULL AND p_current_season = ANY(i_seasonal) THEN 1.0
        WHEN i_seasonal IS NULL OR cardinality(i_seasonal) = 0 THEN 0.85
        ELSE 0.45
      END AS s_season,
      -- quality (always): Bayesian-shrunk rating (m=3, C=3.6) + log-scaled popularity
      ( 0.6 * ( ((3.0*3.6 + COALESCE(i_rating_n,0) * COALESCE(i_avg_rating,3.6))
                  / (3.0 + COALESCE(i_rating_n,0))) - 1 ) / 4.0
      + 0.4 * LEAST(1.0,
                ln(1 + 2.0*COALESCE(i_fav_n,0) + 1.5*COALESCE(i_comp_n,0)
                       + 0.5*COALESCE(i_sugg_n,0)) / ln(41::numeric))
      ) AS s_quality
    FROM flags f
  ),
  agg AS (
    SELECT s.*,
      ( COALESCE(0.28*s_vibe,0) + COALESCE(0.10*s_cat,0) + COALESCE(0.10*s_diet,0)
        + COALESCE(0.10*s_intensity,0)
        + 0.18*s_cost + 0.12*s_season + 0.12*s_quality ) AS num,
      ( (CASE WHEN s_vibe      IS NULL THEN 0 ELSE 0.28 END)
        + (CASE WHEN s_cat       IS NULL THEN 0 ELSE 0.10 END)
        + (CASE WHEN s_diet      IS NULL THEN 0 ELSE 0.10 END)
        + (CASE WHEN s_intensity IS NULL THEN 0 ELSE 0.10 END)
        + 0.18 + 0.12 + 0.12 ) AS den
    FROM s
  )
  SELECT jsonb_build_object(
    'total',     100 * num / den,
    'vibe',      CASE WHEN s_vibe      IS NULL THEN NULL ELSE ROUND((100*s_vibe)::numeric, 0) END,
    'category',  CASE WHEN s_cat       IS NULL THEN NULL ELSE ROUND((100*s_cat)::numeric, 0) END,
    'dietary',   CASE WHEN s_diet      IS NULL THEN NULL ELSE ROUND((100*s_diet)::numeric, 0) END,
    'intensity', CASE WHEN s_intensity IS NULL THEN NULL ELSE ROUND((100*s_intensity)::numeric, 0) END,
    'cost',      ROUND((100*s_cost)::numeric, 0),
    'seasonal',  ROUND((100*s_season)::numeric, 0),
    'quality',   ROUND((100*s_quality)::numeric, 0)
  )
  FROM agg;
$$;

-- 3. Candidate generator: gather rating + popularity stats, score both partners with
--    dn_score_v4, blend totals via the existing harmonic mean, return a richer
--    score_breakdown that includes the viewing partner's per-signal components.
CREATE OR REPLACE FUNCTION public.generate_couple_candidates_v3(
  p_profile_a        UUID,
  p_profile_b        UUID    DEFAULT NULL,
  p_setting_types    TEXT[]  DEFAULT NULL,
  p_intensity_levels INT[]   DEFAULT NULL,
  p_current_season   TEXT    DEFAULT NULL,
  p_limit            INT     DEFAULT 5
) RETURNS TABLE (
  idea_id         UUID,
  idea_data       JSONB,
  match_score     NUMERIC,
  score_breakdown JSONB
)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  WITH pa AS (SELECT * FROM profiles WHERE id = p_profile_a),
       pb AS (SELECT * FROM profiles WHERE id = p_profile_b),
  ratings AS (
    SELECT s.idea_template_id,
           AVG(cd.rating)::NUMERIC AS avg_rating,
           COUNT(cd.rating)::INT   AS rating_n
    FROM completed_dates cd
    JOIN suggestions s ON s.id = cd.suggestion_id
    WHERE cd.rating IS NOT NULL
    GROUP BY s.idea_template_id
  ),
  comp AS (
    SELECT s.idea_template_id, COUNT(*)::INT AS comp_n
    FROM completed_dates cd
    JOIN suggestions s ON s.id = cd.suggestion_id
    GROUP BY s.idea_template_id
  ),
  fav AS (
    SELECT idea_template_id, COUNT(*)::INT AS fav_n
    FROM favorites GROUP BY idea_template_id
  ),
  sugg AS (
    SELECT idea_template_id, COUNT(*)::INT AS sugg_n
    FROM suggestions GROUP BY idea_template_id
  ),
  cand AS (
    SELECT it.*,
           r.avg_rating, COALESCE(r.rating_n,0) AS rating_n,
           COALESCE(f.fav_n,0)  AS fav_n,
           COALESCE(c.comp_n,0) AS comp_n,
           COALESCE(g.sugg_n,0) AS sugg_n
    FROM idea_templates it
    LEFT JOIN ratings r ON r.idea_template_id = it.id
    LEFT JOIN comp    c ON c.idea_template_id = it.id
    LEFT JOIN fav     f ON f.idea_template_id = it.id
    LEFT JOIN sugg    g ON g.idea_template_id = it.id
    WHERE it.is_active
      AND (p_setting_types    IS NULL OR it.setting_type    = ANY(p_setting_types))
      AND (p_intensity_levels IS NULL OR it.intensity_level = ANY(p_intensity_levels))
      AND NOT EXISTS (
        SELECT 1 FROM exclusions e
        WHERE e.idea_template_id = it.id
          AND e.excluded_until > now()
          AND e.profile_id IN (p_profile_a, COALESCE(p_profile_b, p_profile_a))
      )
  ),
  scored AS (
    SELECT
      c.id,
      c.title, c.description, c.category, c.cost_level,
      c.estimated_cost_min, c.estimated_cost_max, c.duration_minutes,
      c.vibe_tags, c.requires_reservation, c.search_keywords, c.venue_type,
      c.setting_type, c.intensity_level, c.quick_filters, c.reservation_platforms,
      dn_score_v4(pa.vibe_tags, pa.cost_levels, pa.budget_max, pa.dietary_restrictions,
                  pa.favorite_categories, pa.preferred_intensity_levels,
                  c.vibe_tags, c.category, c.cost_level, c.estimated_cost_min, c.intensity_level,
                  c.dietary_friendly, c.seasonal,
                  c.avg_rating, c.rating_n, c.fav_n, c.comp_n, c.sugg_n,
                  p_current_season) AS comp_a,
      CASE WHEN p_profile_b IS NULL THEN NULL ELSE
        dn_score_v4(pb.vibe_tags, pb.cost_levels, pb.budget_max, pb.dietary_restrictions,
                    pb.favorite_categories, pb.preferred_intensity_levels,
                    c.vibe_tags, c.category, c.cost_level, c.estimated_cost_min, c.intensity_level,
                    c.dietary_friendly, c.seasonal,
                    c.avg_rating, c.rating_n, c.fav_n, c.comp_n, c.sugg_n,
                    p_current_season)
      END AS comp_b
    FROM cand c
    CROSS JOIN pa
    LEFT JOIN pb ON TRUE
  ),
  blended AS (
    SELECT s.*,
      (s.comp_a->>'total')::NUMERIC AS score_a,
      CASE WHEN s.comp_b IS NULL THEN NULL ELSE (s.comp_b->>'total')::NUMERIC END AS score_b,
      CASE
        WHEN s.comp_b IS NULL THEN (s.comp_a->>'total')::NUMERIC
        WHEN ((s.comp_a->>'total')::NUMERIC + (s.comp_b->>'total')::NUMERIC) = 0 THEN 0
        ELSE 2 * (s.comp_a->>'total')::NUMERIC * (s.comp_b->>'total')::NUMERIC
             / ((s.comp_a->>'total')::NUMERIC + (s.comp_b->>'total')::NUMERIC)
      END AS final_score
    FROM scored s
  )
  SELECT
    b.id AS idea_id,
    jsonb_build_object(
      'id', b.id, 'title', b.title, 'description', b.description,
      'category', b.category, 'cost_level', b.cost_level,
      'estimated_cost_min', b.estimated_cost_min, 'estimated_cost_max', b.estimated_cost_max,
      'duration_minutes', b.duration_minutes, 'vibe_tags', b.vibe_tags,
      'requires_reservation', b.requires_reservation, 'search_keywords', b.search_keywords,
      'venue_type', b.venue_type, 'setting_type', b.setting_type,
      'intensity_level', b.intensity_level, 'quick_filters', b.quick_filters,
      'reservation_platforms', b.reservation_platforms
    ) AS idea_data,
    ROUND(b.final_score, 1) AS match_score,
    jsonb_build_object(
      'score_a',   ROUND(b.score_a, 1),
      'score_b',   CASE WHEN b.score_b IS NULL THEN NULL ELSE ROUND(b.score_b, 1) END,
      'final',     ROUND(b.final_score, 1),
      'signals_a', b.comp_a
    ) AS score_breakdown
  FROM blended b
  ORDER BY b.final_score DESC, random()
  LIMIT GREATEST(1, p_limit);
$$;

-- 4. Grants. dn_score_v4 is only called internally by the (SECURITY INVOKER)
--    generator, never directly by the client — grant to authenticated + service_role
--    only (consistent with migration 022; NOT anon). Re-assert the generator grants.
GRANT EXECUTE ON FUNCTION public.dn_score_v4(TEXT[],INT[],INT,TEXT[],TEXT[],INT[],TEXT[],TEXT,INT,INT,INT,TEXT[],TEXT[],NUMERIC,INT,INT,INT,INT,TEXT)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_couple_candidates_v3(uuid,uuid,text[],int[],text,int)
  TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
