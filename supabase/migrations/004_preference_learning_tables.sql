-- Preference Learning System for Date Nite
-- Implements multi-dimensional scoring and user preference learning

-- =============================================================================
-- USER PREFERENCE WEIGHTS TABLE
-- =============================================================================
-- Stores learned preference weights for each user
-- Weights: 1.0 = neutral, >1.0 = prefer, <1.0 = avoid

CREATE TABLE IF NOT EXISTS user_preference_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Dimension weights (JSONB for flexibility)
  -- Example: {"romantic": 1.3, "adventurous": 0.7, "casual": 1.0}
  vibe_weights JSONB DEFAULT '{}'::JSONB,
  category_weights JSONB DEFAULT '{}'::JSONB,
  setting_weights JSONB DEFAULT '{}'::JSONB,
  intensity_weights JSONB DEFAULT '{}'::JSONB,
  cost_level_weights JSONB DEFAULT '{}'::JSONB,

  -- Aggregate statistics
  total_completions INTEGER DEFAULT 0,
  total_suggestions INTEGER DEFAULT 0,
  avg_rating NUMERIC(3, 2) DEFAULT NULL,
  completion_rate NUMERIC(3, 2) DEFAULT NULL,

  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(profile_id),
  CHECK (total_completions >= 0),
  CHECK (total_suggestions >= 0),
  CHECK (avg_rating IS NULL OR (avg_rating >= 1 AND avg_rating <= 5)),
  CHECK (completion_rate IS NULL OR (completion_rate >= 0 AND completion_rate <= 1))
);

-- Indexes
CREATE INDEX idx_user_preference_weights_profile ON user_preference_weights(profile_id);
CREATE INDEX idx_user_preference_weights_updated ON user_preference_weights(last_updated DESC);

-- =============================================================================
-- MATCHING SCORES LOG TABLE
-- =============================================================================
-- Logs every suggestion generation for ML optimization and debugging

CREATE TABLE IF NOT EXISTS matching_scores_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL,

  -- Candidate ideas that were scored (top 10)
  -- Format: [{"id": "uuid", "score": 75.5, "breakdown": {...}}, ...]
  candidate_ideas JSONB NOT NULL,

  -- Filters applied during generation
  filters_applied JSONB,

  -- Context at time of generation
  season TEXT,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  time_of_day TEXT,
  current_date DATE DEFAULT CURRENT_DATE,

  -- Selected idea
  selected_idea_id UUID REFERENCES idea_templates(id) ON DELETE SET NULL,
  selected_score NUMERIC(10, 4),

  -- Generation metadata
  total_candidates INTEGER,
  generation_time_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (total_candidates > 0)
);

-- Indexes
CREATE INDEX idx_matching_scores_log_profile ON matching_scores_log(profile_id);
CREATE INDEX idx_matching_scores_log_created ON matching_scores_log(created_at DESC);
CREATE INDEX idx_matching_scores_log_suggestion ON matching_scores_log(suggestion_id);
CREATE INDEX idx_matching_scores_log_selected_idea ON matching_scores_log(selected_idea_id);

-- =============================================================================
-- IDEA PERFORMANCE METRICS TABLE
-- =============================================================================
-- Tracks aggregate performance metrics for each idea template

CREATE TABLE IF NOT EXISTS idea_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_template_id UUID NOT NULL REFERENCES idea_templates(id) ON DELETE CASCADE,

  -- Usage statistics
  times_suggested INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  times_skipped INTEGER DEFAULT 0,
  times_favorited INTEGER DEFAULT 0,

  -- Quality metrics
  avg_rating NUMERIC(3, 2),
  total_ratings INTEGER DEFAULT 0,
  would_repeat_count INTEGER DEFAULT 0,
  would_repeat_ratio NUMERIC(3, 2),

  -- Cost accuracy
  avg_actual_cost NUMERIC(10, 2),
  cost_variance NUMERIC(10, 2),

  -- Timestamps
  last_suggested_at TIMESTAMPTZ,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(idea_template_id),
  CHECK (times_suggested >= 0),
  CHECK (times_completed >= 0),
  CHECK (times_skipped >= 0),
  CHECK (times_favorited >= 0),
  CHECK (total_ratings >= 0),
  CHECK (would_repeat_count >= 0),
  CHECK (avg_rating IS NULL OR (avg_rating >= 1 AND avg_rating <= 5)),
  CHECK (would_repeat_ratio IS NULL OR (would_repeat_ratio >= 0 AND would_repeat_ratio <= 1))
);

-- Indexes
CREATE INDEX idx_idea_performance_metrics_template ON idea_performance_metrics(idea_template_id);
CREATE INDEX idx_idea_performance_metrics_rating ON idea_performance_metrics(avg_rating DESC);
CREATE INDEX idx_idea_performance_metrics_suggested ON idea_performance_metrics(times_suggested DESC);
CREATE INDEX idx_idea_performance_metrics_completed ON idea_performance_metrics(times_completed DESC);

-- =============================================================================
-- ENHANCE EXISTING TABLES
-- =============================================================================

-- Add fields to idea_templates for advanced matching
ALTER TABLE idea_templates
  ADD COLUMN IF NOT EXISTS popularity_score NUMERIC(5, 2) DEFAULT 50.0,
  ADD COLUMN IF NOT EXISTS seasonality_strict BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS time_of_day_tags TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN idea_templates.popularity_score IS 'Global popularity score (0-100), adjusted based on completion rates';
COMMENT ON COLUMN idea_templates.seasonality_strict IS 'If true, only suggest during specified seasons';
COMMENT ON COLUMN idea_templates.time_of_day_tags IS 'Preferred times: morning, afternoon, evening, night';

-- Seed time_of_day_tags for existing ideas
UPDATE idea_templates
SET time_of_day_tags = CASE
  WHEN category = 'restaurant' AND duration_minutes >= 180 THEN ARRAY['evening', 'dinner']::TEXT[]
  WHEN category = 'outdoor' THEN ARRAY['morning', 'afternoon']::TEXT[]
  WHEN category = 'entertainment' THEN ARRAY['evening', 'night']::TEXT[]
  WHEN category = 'cultural' THEN ARRAY['afternoon', 'evening']::TEXT[]
  WHEN category = 'adventure' THEN ARRAY['morning', 'afternoon']::TEXT[]
  WHEN category = 'relaxation' THEN ARRAY['afternoon', 'evening']::TEXT[]
  ELSE ARRAY['morning', 'afternoon', 'evening']::TEXT[]
END
WHERE time_of_day_tags = '{}';

-- =============================================================================
-- ROW-LEVEL SECURITY
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE user_preference_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_scores_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for user_preference_weights
CREATE POLICY "Users can view own preference weights"
ON user_preference_weights FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own preference weights"
ON user_preference_weights FOR UPDATE
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own preference weights"
ON user_preference_weights FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Policies for matching_scores_log
CREATE POLICY "Users can view own matching scores"
ON matching_scores_log FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own matching scores"
ON matching_scores_log FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Policies for idea_performance_metrics (read-only for users)
CREATE POLICY "Authenticated users can view idea metrics"
ON idea_performance_metrics FOR SELECT
USING (auth.role() = 'authenticated');

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Initialize preference weights for a new user
CREATE OR REPLACE FUNCTION initialize_preference_weights(p_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_preference_weights (profile_id)
  VALUES (p_profile_id)
  ON CONFLICT (profile_id) DO NOTHING;
END;
$$;

-- Update idea performance metrics after suggestion
CREATE OR REPLACE FUNCTION increment_suggestion_count(p_idea_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO idea_performance_metrics (idea_template_id, times_suggested, last_suggested_at)
  VALUES (p_idea_id, 1, NOW())
  ON CONFLICT (idea_template_id) DO UPDATE
  SET times_suggested = idea_performance_metrics.times_suggested + 1,
      last_suggested_at = NOW(),
      updated_at = NOW();
END;
$$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE user_preference_weights IS 'Learned preference weights for personalized matching';
COMMENT ON TABLE matching_scores_log IS 'Logs every suggestion generation for ML optimization';
COMMENT ON TABLE idea_performance_metrics IS 'Aggregate performance metrics for each date idea';

COMMENT ON COLUMN user_preference_weights.vibe_weights IS 'JSONB weights for vibe tags (e.g., {"romantic": 1.3})';
COMMENT ON COLUMN user_preference_weights.completion_rate IS 'Ratio of completed to suggested dates';
COMMENT ON COLUMN matching_scores_log.candidate_ideas IS 'Top scored candidates with breakdown';
COMMENT ON COLUMN idea_performance_metrics.would_repeat_ratio IS 'Percentage of users who would repeat this date';
