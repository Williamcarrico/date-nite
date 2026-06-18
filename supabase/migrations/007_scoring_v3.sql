-- =============================================================================
-- Date Nite scoring v3  (APPLIED to live DB 2026-06)
--
-- Self-contained, additive scorer bounded to 0..100 BY CONSTRUCTION. Returns
-- top-N candidates. Supports an optional partner (two-player blend via harmonic
-- mean -> rewards mutual appeal). Excludes ideas in EITHER partner's active
-- exclusions.
--
-- Supersedes the never-deployed 004/005/006 migrations, which referenced
-- columns/tables that do not exist in the live schema (preferred_cost_level,
-- favorite_categories, seasonality_strict, time_of_day_tags, dietary_compatibility,
-- user_preference_weights, idea_performance_metrics). This function depends ONLY
-- on columns that exist: profiles.{vibe_tags,cost_levels,budget_max,
-- dietary_restrictions} and idea_templates.* plus completed_dates for community
-- quality.
-- =============================================================================

-- Scalar sub-scorer for one profile vs one candidate. Result in [0,1] * 100.
CREATE OR REPLACE FUNCTION dn_score_one(
  p_vibe_tags        TEXT[],
  p_cost_levels      INT[],
  p_budget_max       INT,
  p_dietary          TEXT[],
  i_vibe_tags        TEXT[],
  i_cost_level       INT,
  i_cost_min         INT,
  i_dietary_friendly TEXT[],
  i_seasonal         TEXT[],
  i_avg_rating       NUMERIC,
  p_current_season   TEXT
) RETURNS NUMERIC
LANGUAGE sql IMMUTABLE AS $$
  SELECT 100 * (
      0.40 * (CASE
        WHEN COALESCE(array_length(p_vibe_tags, 1), 0) = 0 THEN 0.6
        ELSE LEAST(1.0, 0.4 + 0.6 * (
          COALESCE(cardinality(ARRAY(
            SELECT UNNEST(i_vibe_tags) INTERSECT SELECT UNNEST(p_vibe_tags)
          )), 0)::NUMERIC / array_length(p_vibe_tags, 1)
        ))
      END)
    + 0.20 * (CASE
        WHEN i_cost_min IS NOT NULL AND p_budget_max IS NOT NULL AND i_cost_min > p_budget_max THEN 0.2
        WHEN p_cost_levels IS NOT NULL AND i_cost_level = ANY(p_cost_levels) THEN 1.0
        ELSE 0.5
      END)
    + 0.10 * (CASE
        WHEN COALESCE(array_length(p_dietary, 1), 0) = 0 THEN 1.0
        WHEN i_dietary_friendly && p_dietary THEN 1.0
        ELSE 0.5
      END)
    + 0.15 * (CASE
        WHEN i_seasonal IS NULL THEN 1.0
        WHEN p_current_season IS NOT NULL AND p_current_season = ANY(i_seasonal) THEN 1.0
        ELSE 0.4
      END)
    + 0.15 * COALESCE((i_avg_rating - 1) / 4.0, 0.6)
  );
$$;

COMMENT ON FUNCTION dn_score_one IS 'Date Nite v3: single-profile fit score in [0,100] for one candidate idea. Additive and bounded by construction.';

CREATE OR REPLACE FUNCTION generate_couple_candidates_v3(
  p_profile_a       UUID,
  p_profile_b       UUID    DEFAULT NULL,
  p_setting_types   TEXT[]  DEFAULT NULL,
  p_intensity_levels INT[]  DEFAULT NULL,
  p_current_season  TEXT    DEFAULT NULL,
  p_limit           INT     DEFAULT 5
) RETURNS TABLE (
  idea_id         UUID,
  idea_data       JSONB,
  match_score     NUMERIC,
  score_breakdown JSONB
)
LANGUAGE sql STABLE SECURITY INVOKER AS $$
  WITH pa AS (SELECT * FROM profiles WHERE id = p_profile_a),
       pb AS (SELECT * FROM profiles WHERE id = p_profile_b),
  quality AS (
    SELECT s.idea_template_id, AVG(cd.rating)::NUMERIC AS avg_rating
    FROM completed_dates cd
    JOIN suggestions s ON s.id = cd.suggestion_id
    WHERE cd.rating IS NOT NULL
    GROUP BY s.idea_template_id
  ),
  cand AS (
    SELECT it.*, q.avg_rating
    FROM idea_templates it
    LEFT JOIN quality q ON q.idea_template_id = it.id
    WHERE it.is_active
      AND (p_setting_types IS NULL OR it.setting_type = ANY(p_setting_types))
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
      dn_score_one(pa.vibe_tags, pa.cost_levels, pa.budget_max, pa.dietary_restrictions,
                   c.vibe_tags, c.cost_level, c.estimated_cost_min, c.dietary_friendly,
                   c.seasonal, c.avg_rating, p_current_season) AS score_a,
      CASE WHEN p_profile_b IS NULL THEN NULL ELSE
        dn_score_one(pb.vibe_tags, pb.cost_levels, pb.budget_max, pb.dietary_restrictions,
                     c.vibe_tags, c.cost_level, c.estimated_cost_min, c.dietary_friendly,
                     c.seasonal, c.avg_rating, p_current_season)
      END AS score_b
    FROM cand c
    CROSS JOIN pa
    LEFT JOIN pb ON TRUE
  ),
  blended AS (
    SELECT s.*,
      CASE
        WHEN score_b IS NULL THEN score_a
        WHEN (score_a + score_b) = 0 THEN 0
        ELSE 2 * score_a * score_b / (score_a + score_b)
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
      'score_a', ROUND(b.score_a, 1),
      'score_b', CASE WHEN b.score_b IS NULL THEN NULL ELSE ROUND(b.score_b, 1) END,
      'final',   ROUND(b.final_score, 1)
    ) AS score_breakdown
  FROM blended b
  ORDER BY b.final_score DESC, random()
  LIMIT GREATEST(1, p_limit);
$$;

COMMENT ON FUNCTION generate_couple_candidates_v3 IS 'Date Nite v3: top-N scored candidates (0-100, bounded). Optional partner blends both partners'' fit via harmonic mean. Excludes ideas in either partner''s active exclusions.';
</content>
