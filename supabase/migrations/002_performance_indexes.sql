-- Performance indexes for Date Nite
-- Optimizes query performance for suggestion generation and filtering

-- =============================================================================
-- IDEA TEMPLATES INDEXES
-- =============================================================================

-- Composite index for filtered candidate selection
-- Speeds up queries that filter by active status and multiple attributes
CREATE INDEX IF NOT EXISTS idx_idea_templates_active_filters
ON idea_templates(is_active, setting_type, intensity_level, cost_level)
WHERE is_active = true;

-- Partial index for seasonal filtering
-- Uses GIN (Generalized Inverted Index) for array lookups
CREATE INDEX IF NOT EXISTS idx_idea_templates_seasonal
ON idea_templates USING GIN(seasonal)
WHERE seasonal IS NOT NULL;

-- Index for category filtering (frequently used in queries)
CREATE INDEX IF NOT EXISTS idx_idea_templates_category
ON idea_templates(category)
WHERE is_active = true;

-- GIN index for vibe_tags array searches
CREATE INDEX IF NOT EXISTS idx_idea_templates_vibe_tags
ON idea_templates USING GIN(vibe_tags);

-- Index for cost-based queries
CREATE INDEX IF NOT EXISTS idx_idea_templates_cost
ON idea_templates(cost_level, estimated_cost_min, estimated_cost_max)
WHERE is_active = true;

-- Index for duration-based queries
CREATE INDEX IF NOT EXISTS idx_idea_templates_duration
ON idea_templates(duration_minutes)
WHERE is_active = true;

-- =============================================================================
-- EXCLUSIONS TABLE INDEXES
-- =============================================================================

-- Optimizes lookup of active exclusions for a profile
CREATE INDEX IF NOT EXISTS idx_exclusions_active
ON exclusions(profile_id, idea_template_id, excluded_until)
WHERE excluded_until > CURRENT_TIMESTAMP;

-- Index for cleanup queries (expired exclusions)
CREATE INDEX IF NOT EXISTS idx_exclusions_expired
ON exclusions(excluded_until)
WHERE excluded_until <= CURRENT_TIMESTAMP;

-- Composite index for checking specific idea exclusion
CREATE INDEX IF NOT EXISTS idx_exclusions_profile_idea
ON exclusions(profile_id, idea_template_id);

-- =============================================================================
-- PROFILES TABLE INDEXES
-- =============================================================================

-- GIN indexes for array-based preference lookups
CREATE INDEX IF NOT EXISTS idx_profiles_vibe_tags
ON profiles USING GIN(vibe_tags);

CREATE INDEX IF NOT EXISTS idx_profiles_cost_levels
ON profiles USING GIN(cost_levels);

CREATE INDEX IF NOT EXISTS idx_profiles_dietary_preferences
ON profiles USING GIN(dietary_preferences);

-- Index for location-based queries (for future venue integration)
CREATE INDEX IF NOT EXISTS idx_profiles_location
ON profiles(location_city, location_state)
WHERE location_city IS NOT NULL;

-- =============================================================================
-- SUGGESTIONS TABLE INDEXES
-- =============================================================================

-- Composite index for user's suggestion history
CREATE INDEX IF NOT EXISTS idx_suggestions_profile_status
ON suggestions(profile_id, status, created_at DESC);

-- Index for scheduled suggestions
CREATE INDEX IF NOT EXISTS idx_suggestions_scheduled
ON suggestions(scheduled_at)
WHERE scheduled_at IS NOT NULL AND status = 'scheduled';

-- Index for profile + template lookups (prevents duplicates)
CREATE INDEX IF NOT EXISTS idx_suggestions_profile_template
ON suggestions(profile_id, idea_template_id);

-- =============================================================================
-- COMPLETED DATES TABLE INDEXES
-- =============================================================================

-- Index for user's completion history and analytics
CREATE INDEX IF NOT EXISTS idx_completed_dates_profile
ON completed_dates(profile_id, completed_at DESC);

-- Index for suggestion relationship
CREATE INDEX IF NOT EXISTS idx_completed_dates_suggestion
ON completed_dates(suggestion_id);

-- Index for rating-based queries
CREATE INDEX IF NOT EXISTS idx_completed_dates_rating
ON completed_dates(rating)
WHERE rating IS NOT NULL;

-- =============================================================================
-- FAVORITES TABLE INDEXES
-- =============================================================================

-- Composite index for checking if idea is favorited
CREATE INDEX IF NOT EXISTS idx_favorites_profile_idea
ON favorites(profile_id, idea_template_id);

-- Index for user's favorite list
CREATE INDEX IF NOT EXISTS idx_favorites_profile
ON favorites(profile_id, created_at DESC);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Run these queries to verify indexes were created:
-- SELECT schemaname, tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- Check index usage after some time in production:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

COMMENT ON INDEX idx_idea_templates_active_filters IS 'Composite index for filtered candidate selection in suggestion generation';
COMMENT ON INDEX idx_idea_templates_seasonal IS 'GIN index for seasonal array lookups';
COMMENT ON INDEX idx_exclusions_active IS 'Partial index for active 90-day exclusions';
COMMENT ON INDEX idx_profiles_vibe_tags IS 'GIN index for vibe preference matching';
COMMENT ON INDEX idx_suggestions_profile_status IS 'Composite index for user suggestion history queries';
