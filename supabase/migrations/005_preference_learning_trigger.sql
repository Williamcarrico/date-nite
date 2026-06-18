-- Preference Learning Trigger for Date Nite
-- Automatically updates user preference weights when dates are completed

-- =============================================================================
-- PREFERENCE LEARNING FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION update_preference_weights()
RETURNS TRIGGER AS $$
DECLARE
  v_idea RECORD;
  v_current_weights RECORD;
  v_adjustment NUMERIC;
  v_new_vibe_weights JSONB;
  v_new_category_weights JSONB;
  v_new_setting_weights JSONB;
  v_new_intensity_weights JSONB;
  v_new_cost_weights JSONB;
  v_vibe_tag TEXT;
  v_current_weight NUMERIC;
BEGIN
  -- Only process if rating is provided
  IF NEW.rating IS NULL THEN
    RETURN NEW;
  END IF;

  -- Fetch the idea template details via suggestion
  SELECT
    it.id,
    it.category,
    it.vibe_tags,
    it.setting_type,
    it.intensity_level,
    it.cost_level
  INTO v_idea
  FROM idea_templates it
  JOIN suggestions s ON s.idea_template_id = it.id
  WHERE s.id = NEW.suggestion_id;

  -- If idea not found, skip processing
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Calculate adjustment based on rating
  v_adjustment := CASE
    WHEN NEW.rating >= 4 THEN 0.1   -- Boost liked attributes
    WHEN NEW.rating <= 2 THEN -0.1  -- Penalize disliked attributes
    ELSE 0.05                        -- Mild boost for neutral
  END;

  -- Ensure user has preference weights record
  INSERT INTO user_preference_weights (profile_id)
  VALUES (NEW.profile_id)
  ON CONFLICT (profile_id) DO NOTHING;

  -- Fetch current weights
  SELECT
    vibe_weights,
    category_weights,
    setting_weights,
    intensity_weights,
    cost_level_weights,
    total_completions,
    avg_rating
  INTO v_current_weights
  FROM user_preference_weights
  WHERE profile_id = NEW.profile_id;

  -- Initialize new weight objects
  v_new_vibe_weights := COALESCE(v_current_weights.vibe_weights, '{}'::JSONB);
  v_new_category_weights := COALESCE(v_current_weights.category_weights, '{}'::JSONB);
  v_new_setting_weights := COALESCE(v_current_weights.setting_weights, '{}'::JSONB);
  v_new_intensity_weights := COALESCE(v_current_weights.intensity_weights, '{}'::JSONB);
  v_new_cost_weights := COALESCE(v_current_weights.cost_level_weights, '{}'::JSONB);

  -- =============================================================================
  -- Update vibe_weights (for each vibe tag in the idea)
  -- =============================================================================
  IF v_idea.vibe_tags IS NOT NULL THEN
    FOREACH v_vibe_tag IN ARRAY v_idea.vibe_tags LOOP
      -- Get current weight (default to 1.0 if not set)
      v_current_weight := COALESCE(
        (v_new_vibe_weights->>v_vibe_tag)::NUMERIC,
        1.0
      );

      -- Apply adjustment with bounds (0.3 to 2.0)
      v_current_weight := GREATEST(0.3, LEAST(2.0, v_current_weight + v_adjustment));

      -- Update JSONB
      v_new_vibe_weights := jsonb_set(
        v_new_vibe_weights,
        ARRAY[v_vibe_tag],
        to_jsonb(v_current_weight)
      );
    END LOOP;
  END IF;

  -- =============================================================================
  -- Update category_weights
  -- =============================================================================
  IF v_idea.category IS NOT NULL THEN
    v_current_weight := COALESCE(
      (v_new_category_weights->>v_idea.category)::NUMERIC,
      1.0
    );
    v_current_weight := GREATEST(0.3, LEAST(2.0, v_current_weight + v_adjustment));
    v_new_category_weights := jsonb_set(
      v_new_category_weights,
      ARRAY[v_idea.category],
      to_jsonb(v_current_weight)
    );
  END IF;

  -- =============================================================================
  -- Update setting_weights
  -- =============================================================================
  IF v_idea.setting_type IS NOT NULL THEN
    v_current_weight := COALESCE(
      (v_new_setting_weights->>v_idea.setting_type)::NUMERIC,
      1.0
    );
    v_current_weight := GREATEST(0.3, LEAST(2.0, v_current_weight + v_adjustment));
    v_new_setting_weights := jsonb_set(
      v_new_setting_weights,
      ARRAY[v_idea.setting_type],
      to_jsonb(v_current_weight)
    );
  END IF;

  -- =============================================================================
  -- Update intensity_weights
  -- =============================================================================
  IF v_idea.intensity_level IS NOT NULL THEN
    v_current_weight := COALESCE(
      (v_new_intensity_weights->>v_idea.intensity_level::TEXT)::NUMERIC,
      1.0
    );
    v_current_weight := GREATEST(0.3, LEAST(2.0, v_current_weight + v_adjustment));
    v_new_intensity_weights := jsonb_set(
      v_new_intensity_weights,
      ARRAY[v_idea.intensity_level::TEXT],
      to_jsonb(v_current_weight)
    );
  END IF;

  -- =============================================================================
  -- Update cost_level_weights
  -- =============================================================================
  IF v_idea.cost_level IS NOT NULL THEN
    v_current_weight := COALESCE(
      (v_new_cost_weights->>v_idea.cost_level::TEXT)::NUMERIC,
      1.0
    );
    v_current_weight := GREATEST(0.3, LEAST(2.0, v_current_weight + v_adjustment));
    v_new_cost_weights := jsonb_set(
      v_new_cost_weights,
      ARRAY[v_idea.cost_level::TEXT],
      to_jsonb(v_current_weight)
    );
  END IF;

  -- =============================================================================
  -- Update aggregate statistics
  -- =============================================================================
  UPDATE user_preference_weights
  SET
    vibe_weights = v_new_vibe_weights,
    category_weights = v_new_category_weights,
    setting_weights = v_new_setting_weights,
    intensity_weights = v_new_intensity_weights,
    cost_level_weights = v_new_cost_weights,
    total_completions = total_completions + 1,
    avg_rating = (
      COALESCE(avg_rating * total_completions, 0) + NEW.rating
    ) / (total_completions + 1),
    completion_rate = (
      CASE
        WHEN total_suggestions > 0
        THEN (total_completions + 1)::NUMERIC / total_suggestions::NUMERIC
        ELSE NULL
      END
    ),
    last_updated = NOW(),
    updated_at = NOW()
  WHERE profile_id = NEW.profile_id;

  -- =============================================================================
  -- Update idea performance metrics
  -- =============================================================================
  INSERT INTO idea_performance_metrics (
    idea_template_id,
    times_completed,
    total_ratings,
    avg_rating,
    would_repeat_count,
    would_repeat_ratio,
    avg_actual_cost,
    last_completed_at,
    updated_at
  )
  VALUES (
    v_idea.id,
    1,
    1,
    NEW.rating,
    CASE WHEN NEW.would_repeat THEN 1 ELSE 0 END,
    CASE WHEN NEW.would_repeat THEN 1.0 ELSE 0.0 END,
    NEW.actual_cost,
    NOW(),
    NOW()
  )
  ON CONFLICT (idea_template_id) DO UPDATE
  SET
    times_completed = idea_performance_metrics.times_completed + 1,
    total_ratings = idea_performance_metrics.total_ratings + 1,
    avg_rating = (
      COALESCE(idea_performance_metrics.avg_rating * idea_performance_metrics.total_ratings, 0) + NEW.rating
    ) / (idea_performance_metrics.total_ratings + 1),
    would_repeat_count = idea_performance_metrics.would_repeat_count + CASE WHEN NEW.would_repeat THEN 1 ELSE 0 END,
    would_repeat_ratio = (
      idea_performance_metrics.would_repeat_count + CASE WHEN NEW.would_repeat THEN 1 ELSE 0 END
    )::NUMERIC / (idea_performance_metrics.times_completed + 1)::NUMERIC,
    avg_actual_cost = (
      COALESCE(idea_performance_metrics.avg_actual_cost * idea_performance_metrics.times_completed, 0) + COALESCE(NEW.actual_cost, 0)
    ) / NULLIF(idea_performance_metrics.times_completed + 1, 0),
    last_completed_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CREATE TRIGGER
-- =============================================================================

DROP TRIGGER IF EXISTS trg_update_preference_weights ON completed_dates;

CREATE TRIGGER trg_update_preference_weights
AFTER INSERT ON completed_dates
FOR EACH ROW
EXECUTE FUNCTION update_preference_weights();

-- =============================================================================
-- TRIGGER FOR SUGGESTION TRACKING
-- =============================================================================
-- Track when suggestions are created to update total_suggestions count

CREATE OR REPLACE FUNCTION track_suggestion_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize preference weights if not exists
  INSERT INTO user_preference_weights (profile_id, total_suggestions)
  VALUES (NEW.profile_id, 1)
  ON CONFLICT (profile_id) DO UPDATE
  SET total_suggestions = user_preference_weights.total_suggestions + 1,
      completion_rate = (
        CASE
          WHEN user_preference_weights.total_suggestions + 1 > 0
          THEN user_preference_weights.total_completions::NUMERIC / (user_preference_weights.total_suggestions + 1)::NUMERIC
          ELSE NULL
        END
      ),
      updated_at = NOW();

  -- Update idea performance metrics
  PERFORM increment_suggestion_count(NEW.idea_template_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_track_suggestion_created ON suggestions;

CREATE TRIGGER trg_track_suggestion_created
AFTER INSERT ON suggestions
FOR EACH ROW
EXECUTE FUNCTION track_suggestion_created();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION update_preference_weights() IS 'Automatically updates user preference weights and idea metrics when dates are completed';
COMMENT ON FUNCTION track_suggestion_created() IS 'Tracks suggestion creation to maintain accurate total_suggestions count';
COMMENT ON TRIGGER trg_update_preference_weights ON completed_dates IS 'Fires after date completion to learn user preferences';
COMMENT ON TRIGGER trg_track_suggestion_created ON suggestions IS 'Fires after suggestion creation to track statistics';
