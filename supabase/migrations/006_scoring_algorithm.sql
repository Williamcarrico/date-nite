-- Multi-Dimensional Scoring Algorithm for Date Nite
-- Implements intelligent suggestion matching with preference learning

-- =============================================================================
-- GENERATE SUGGESTION V2 - Main Scoring Function
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_suggestion_v2(
  p_profile_id UUID,
  p_setting_types TEXT[] DEFAULT NULL,
  p_intensity_levels INTEGER[] DEFAULT NULL,
  p_current_season TEXT DEFAULT NULL,
  p_day_of_week INTEGER DEFAULT NULL,
  p_time_of_day TEXT DEFAULT NULL,
  p_current_date DATE DEFAULT CURRENT_DATE,
  p_max_candidates INTEGER DEFAULT 100,
  p_enable_learning BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  idea_id UUID,
  idea_data JSONB,
  match_score NUMERIC,
  score_breakdown JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile RECORD;
  v_weights RECORD;
  v_candidate RECORD;
  v_scores RECORD[];
  v_score_record RECORD;
  v_final_score NUMERIC;
  v_base_score NUMERIC := 50.0;
  v_budget_fit NUMERIC;
  v_preference_mult NUMERIC;
  v_temporal_mult NUMERIC;
  v_freshness_mult NUMERIC;
  v_performance_mult NUMERIC;
  v_context_bonus NUMERIC;
  v_penalties NUMERIC;
  v_breakdown JSONB;
  v_vibe_score NUMERIC;
  v_category_score NUMERIC;
  v_setting_score NUMERIC;
  v_intensity_score NUMERIC;
  v_cost_score NUMERIC;
  v_overlap_count INTEGER;
  v_days_since_suggested INTEGER;
  v_completion_rate NUMERIC;
  v_rating_bonus NUMERIC;
BEGIN
  -- =============================================================================
  -- FETCH PROFILE AND PREFERENCE WEIGHTS
  -- =============================================================================
  SELECT
    p.id,
    p.preferred_cost_level,
    p.budget_min,
    p.budget_max,
    p.dietary_preferences,
    p.favorite_categories,
    p.preferred_day_of_week,
    p.preferred_time_of_day
  INTO v_profile
  FROM profiles p
  WHERE p.id = p_profile_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Get learned preference weights (or initialize if new user)
  SELECT
    vibe_weights,
    category_weights,
    setting_weights,
    intensity_weights,
    cost_level_weights,
    total_completions
  INTO v_weights
  FROM user_preference_weights
  WHERE profile_id = p_profile_id;

  -- If no weights exist, use defaults
  IF NOT FOUND THEN
    v_weights.vibe_weights := '{}'::JSONB;
    v_weights.category_weights := '{}'::JSONB;
    v_weights.setting_weights := '{}'::JSONB;
    v_weights.intensity_weights := '{}'::JSONB;
    v_weights.cost_level_weights := '{}'::JSONB;
    v_weights.total_completions := 0;
  END IF;

  -- =============================================================================
  -- SCORE ALL CANDIDATE IDEAS
  -- =============================================================================
  FOR v_candidate IN
    SELECT
      it.id,
      it.title,
      it.description,
      it.category,
      it.cost_level,
      it.estimated_cost_min,
      it.estimated_cost_max,
      it.duration_minutes,
      it.vibe_tags,
      it.setting_type,
      it.intensity_level,
      it.seasonal,
      it.seasonality_strict,
      it.time_of_day_tags,
      it.popularity_score,
      it.quick_filters,
      it.dietary_compatibility,
      -- Performance metrics
      COALESCE(ipm.times_suggested, 0) as times_suggested,
      COALESCE(ipm.times_completed, 0) as times_completed,
      COALESCE(ipm.avg_rating, 3.0) as avg_rating,
      COALESCE(ipm.would_repeat_ratio, 0.5) as would_repeat_ratio,
      ipm.last_suggested_at
    FROM idea_templates it
    LEFT JOIN idea_performance_metrics ipm ON ipm.idea_template_id = it.id
    WHERE
      it.is_active = TRUE
      -- Filter by setting types if specified
      AND (p_setting_types IS NULL OR it.setting_type = ANY(p_setting_types))
      -- Filter by intensity levels if specified
      AND (p_intensity_levels IS NULL OR it.intensity_level = ANY(p_intensity_levels))
      -- Exclude if in 90-day exclusion window
      AND it.id NOT IN (
        SELECT idea_template_id
        FROM exclusions
        WHERE profile_id = p_profile_id
          AND excluded_until > p_current_date
      )
      -- Check strict seasonality
      AND (
        it.seasonality_strict = FALSE
        OR p_current_season IS NULL
        OR it.seasonal IS NULL
        OR p_current_season = ANY(it.seasonal)
      )
    LIMIT p_max_candidates
  LOOP
    -- =======================================================================
    -- COMPONENT 1: BUDGET FIT (0.5-1.5)
    -- =======================================================================
    IF v_profile.preferred_cost_level IS NOT NULL THEN
      v_budget_fit := 1.5 - (ABS(v_candidate.cost_level - v_profile.preferred_cost_level) * 0.25);
      v_budget_fit := GREATEST(0.5, LEAST(1.5, v_budget_fit));
    ELSE
      v_budget_fit := 1.0;
    END IF;

    -- Check if exceeds budget
    IF v_profile.budget_max IS NOT NULL
       AND v_candidate.estimated_cost_max IS NOT NULL
       AND v_candidate.estimated_cost_max > v_profile.budget_max THEN
      v_budget_fit := v_budget_fit * 0.7; -- Penalty for over budget
    END IF;

    -- =======================================================================
    -- COMPONENT 2: PREFERENCE MULTIPLIER (0.3-2.0)
    -- =======================================================================

    -- 2a. Vibe score (40% weight)
    v_vibe_score := 1.0;
    v_overlap_count := 0;
    IF v_candidate.vibe_tags IS NOT NULL AND array_length(v_candidate.vibe_tags, 1) > 0 THEN
      FOR i IN 1..array_length(v_candidate.vibe_tags, 1) LOOP
        v_vibe_score := v_vibe_score + COALESCE(
          (v_weights.vibe_weights->>v_candidate.vibe_tags[i])::NUMERIC,
          1.0
        );
        v_overlap_count := v_overlap_count + 1;
      END LOOP;
      IF v_overlap_count > 0 THEN
        v_vibe_score := v_vibe_score / v_overlap_count;
      END IF;
    END IF;

    -- 2b. Category score (30% weight)
    v_category_score := COALESCE(
      (v_weights.category_weights->>v_candidate.category)::NUMERIC,
      1.0
    );

    -- 2c. Setting score (20% weight)
    v_setting_score := COALESCE(
      (v_weights.setting_weights->>v_candidate.setting_type)::NUMERIC,
      1.0
    );

    -- 2d. Intensity score (10% weight)
    v_intensity_score := COALESCE(
      (v_weights.intensity_weights->>v_candidate.intensity_level::TEXT)::NUMERIC,
      1.0
    );

    -- Combined preference multiplier
    v_preference_mult :=
      (v_vibe_score * 0.4) +
      (v_category_score * 0.3) +
      (v_setting_score * 0.2) +
      (v_intensity_score * 0.1);

    -- Bounds check
    v_preference_mult := GREATEST(0.3, LEAST(2.0, v_preference_mult));

    -- =======================================================================
    -- COMPONENT 3: TEMPORAL MULTIPLIER (0.7-1.3)
    -- =======================================================================
    v_temporal_mult := 1.0;

    -- Season match
    IF p_current_season IS NOT NULL AND v_candidate.seasonal IS NOT NULL THEN
      IF p_current_season = ANY(v_candidate.seasonal) THEN
        v_temporal_mult := v_temporal_mult * 1.2;
      ELSE
        v_temporal_mult := v_temporal_mult * 0.8;
      END IF;
    END IF;

    -- Day of week match
    IF p_day_of_week IS NOT NULL AND v_profile.preferred_day_of_week IS NOT NULL THEN
      IF p_day_of_week = ANY(v_profile.preferred_day_of_week) THEN
        v_temporal_mult := v_temporal_mult * 1.1;
      ELSE
        v_temporal_mult := v_temporal_mult * 0.9;
      END IF;
    END IF;

    -- Time of day match
    IF p_time_of_day IS NOT NULL AND v_candidate.time_of_day_tags IS NOT NULL THEN
      IF p_time_of_day = ANY(v_candidate.time_of_day_tags) THEN
        v_temporal_mult := v_temporal_mult * 1.1;
      END IF;
    END IF;

    -- Bounds check
    v_temporal_mult := GREATEST(0.7, LEAST(1.3, v_temporal_mult));

    -- =======================================================================
    -- COMPONENT 4: FRESHNESS MULTIPLIER (0.8-1.2)
    -- =======================================================================
    IF v_candidate.last_suggested_at IS NOT NULL THEN
      v_days_since_suggested := p_current_date - v_candidate.last_suggested_at::DATE;

      v_freshness_mult := CASE
        WHEN v_days_since_suggested < 30 THEN 0.8
        WHEN v_days_since_suggested < 60 THEN 0.9
        WHEN v_days_since_suggested > 180 THEN 1.2
        ELSE 1.0
      END;
    ELSE
      v_freshness_mult := 1.1; -- Boost new ideas slightly
    END IF;

    -- =======================================================================
    -- COMPONENT 5: PERFORMANCE MULTIPLIER (0.8-1.3)
    -- =======================================================================
    v_performance_mult := 1.0;

    -- Completion rate bonus
    IF v_candidate.times_suggested > 0 THEN
      v_completion_rate := v_candidate.times_completed::NUMERIC / v_candidate.times_suggested::NUMERIC;
      v_performance_mult := v_performance_mult + (v_completion_rate * 0.2);
    END IF;

    -- Rating bonus
    v_rating_bonus := (v_candidate.avg_rating - 3.0) * 0.1;
    v_performance_mult := v_performance_mult + v_rating_bonus;

    -- Would-repeat bonus
    v_performance_mult := v_performance_mult + (v_candidate.would_repeat_ratio * 0.1);

    -- Bounds check
    v_performance_mult := GREATEST(0.8, LEAST(1.3, v_performance_mult));

    -- =======================================================================
    -- COMPONENT 6: CONTEXT BONUS (0-15 points)
    -- =======================================================================
    v_context_bonus := 0;

    -- Dietary compatibility
    IF v_profile.dietary_preferences IS NOT NULL
       AND v_candidate.dietary_compatibility IS NOT NULL
       AND v_profile.dietary_preferences && v_candidate.dietary_compatibility THEN
      v_context_bonus := v_context_bonus + 5;
    END IF;

    -- Favorite category
    IF v_profile.favorite_categories IS NOT NULL
       AND v_candidate.category = ANY(v_profile.favorite_categories) THEN
      v_context_bonus := v_context_bonus + 5;
    END IF;

    -- High would-repeat ratio
    IF v_candidate.would_repeat_ratio > 0.7 THEN
      v_context_bonus := v_context_bonus + 5;
    END IF;

    -- =======================================================================
    -- COMPONENT 7: PENALTIES (0-20 points)
    -- =======================================================================
    v_penalties := 0;

    -- Recently viewed penalty
    IF v_candidate.last_suggested_at IS NOT NULL THEN
      v_days_since_suggested := p_current_date - v_candidate.last_suggested_at::DATE;
      IF v_days_since_suggested < 7 THEN
        v_penalties := v_penalties + 10;
      END IF;
    END IF;

    -- Way over budget penalty
    IF v_profile.budget_max IS NOT NULL
       AND v_candidate.estimated_cost_min IS NOT NULL
       AND v_candidate.estimated_cost_min > v_profile.budget_max THEN
      v_penalties := v_penalties + 20;
    END IF;

    -- =======================================================================
    -- CALCULATE FINAL SCORE
    -- =======================================================================
    v_final_score :=
      v_base_score
      * v_budget_fit
      * v_preference_mult
      * v_temporal_mult
      * v_freshness_mult
      * v_performance_mult
      + v_context_bonus
      - v_penalties;

    -- Ensure non-negative
    v_final_score := GREATEST(0, v_final_score);

    -- Build breakdown for debugging/ML
    v_breakdown := jsonb_build_object(
      'base_score', v_base_score,
      'budget_fit', v_budget_fit,
      'preference_mult', v_preference_mult,
      'temporal_mult', v_temporal_mult,
      'freshness_mult', v_freshness_mult,
      'performance_mult', v_performance_mult,
      'context_bonus', v_context_bonus,
      'penalties', v_penalties,
      'vibe_score', v_vibe_score,
      'category_score', v_category_score,
      'setting_score', v_setting_score,
      'intensity_score', v_intensity_score
    );

    -- Store in temporary array
    v_score_record := (
      v_candidate.id,
      row_to_json(v_candidate)::JSONB,
      v_final_score,
      v_breakdown
    );

    v_scores := array_append(v_scores, v_score_record);
  END LOOP;

  -- =============================================================================
  -- RETURN TOP SCORED IDEA
  -- =============================================================================
  IF array_length(v_scores, 1) > 0 THEN
    -- Sort by score descending and return top result
    RETURN QUERY
    SELECT
      (unnest(v_scores)).idea_id,
      (unnest(v_scores)).idea_data,
      (unnest(v_scores)).match_score,
      (unnest(v_scores)).score_breakdown
    ORDER BY match_score DESC
    LIMIT 1;
  END IF;

  RETURN;
END;
$$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION generate_suggestion_v2 IS 'Multi-dimensional scoring algorithm with preference learning. Returns best-matched date idea with score breakdown.';
