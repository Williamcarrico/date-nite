-- Row-Level Security (RLS) Policies for Date Nite
-- Ensures users can only access their own data

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =============================================================================
-- SUGGESTIONS TABLE
-- =============================================================================

-- Enable RLS on suggestions table
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view their own suggestions
CREATE POLICY "Users can view own suggestions"
ON suggestions FOR SELECT
USING (auth.uid() = profile_id);

-- Users can insert their own suggestions
CREATE POLICY "Users can insert own suggestions"
ON suggestions FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Users can update their own suggestions
CREATE POLICY "Users can update own suggestions"
ON suggestions FOR UPDATE
USING (auth.uid() = profile_id);

-- Users can delete their own suggestions
CREATE POLICY "Users can delete own suggestions"
ON suggestions FOR DELETE
USING (auth.uid() = profile_id);

-- =============================================================================
-- COMPLETED DATES TABLE
-- =============================================================================

-- Enable RLS on completed_dates table
ALTER TABLE completed_dates ENABLE ROW LEVEL SECURITY;

-- Users can view their own completed dates
CREATE POLICY "Users can view own completed dates"
ON completed_dates FOR SELECT
USING (auth.uid() = profile_id);

-- Users can insert their own completed dates
CREATE POLICY "Users can insert own completed dates"
ON completed_dates FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Users can update their own completed dates
CREATE POLICY "Users can update own completed dates"
ON completed_dates FOR UPDATE
USING (auth.uid() = profile_id);

-- Users can delete their own completed dates
CREATE POLICY "Users can delete own completed dates"
ON completed_dates FOR DELETE
USING (auth.uid() = profile_id);

-- =============================================================================
-- FAVORITES TABLE
-- =============================================================================

-- Enable RLS on favorites table
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
USING (auth.uid() = profile_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid() = profile_id);

-- =============================================================================
-- EXCLUSIONS TABLE
-- =============================================================================

-- Enable RLS on exclusions table
ALTER TABLE exclusions ENABLE ROW LEVEL SECURITY;

-- Users can view their own exclusions
CREATE POLICY "Users can view own exclusions"
ON exclusions FOR SELECT
USING (auth.uid() = profile_id);

-- Users can insert their own exclusions
CREATE POLICY "Users can insert own exclusions"
ON exclusions FOR INSERT
WITH CHECK (auth.uid() = profile_id);

-- Users can update their own exclusions
CREATE POLICY "Users can update own exclusions"
ON exclusions FOR UPDATE
USING (auth.uid() = profile_id);

-- Users can delete their own exclusions
CREATE POLICY "Users can delete own exclusions"
ON exclusions FOR DELETE
USING (auth.uid() = profile_id);

-- =============================================================================
-- IDEA TEMPLATES TABLE (READ-ONLY FOR ALL AUTHENTICATED USERS)
-- =============================================================================

-- Enable RLS on idea_templates table
ALTER TABLE idea_templates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active idea templates
CREATE POLICY "Authenticated users can view active ideas"
ON idea_templates FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);

-- Only admins can modify idea templates (service_role bypass)
-- This is enforced by having no INSERT/UPDATE/DELETE policies for regular users

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check which tables have RLS enabled:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Test a policy (as a specific user):
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claim.sub = '<user-id>';
-- SELECT * FROM suggestions;
-- RESET ROLE;

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Users can only view their own profile data';
COMMENT ON POLICY "Users can view own suggestions" ON suggestions IS 'Users can only view their own suggestion history';
COMMENT ON POLICY "Users can view own completed dates" ON completed_dates IS 'Users can only view their own completed dates';
COMMENT ON POLICY "Users can view own favorites" ON favorites IS 'Users can only view their own favorites';
COMMENT ON POLICY "Users can view own exclusions" ON exclusions IS 'Users can only view their own 90-day exclusions';
COMMENT ON POLICY "Authenticated users can view active ideas" ON idea_templates IS 'All authenticated users can browse active date ideas';
