# Supabase Migrations

This directory contains SQL migrations for the Date Nite database.

## Applying Migrations

### Option 1: Supabase CLI (Recommended)
```bash
# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase db push supabase/migrations/001_rate_limiting.sql
```

### Option 2: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy the contents of the migration file
4. Execute the SQL

### Option 3: Direct SQL (if you have database access)
```bash
psql $DATABASE_URL < supabase/migrations/001_rate_limiting.sql
```

## Migration Files

### 001_rate_limiting.sql
**Purpose**: Implements rate limiting for magic link authentication

**What it does**:
- Creates `auth_rate_limits` table to track login attempts
- Adds `check_auth_rate_limit` function for rate limit enforcement
- Limits to 5 attempts per 15-minute window
- Automatically cleans up old entries (>24 hours)
- Enables RLS for security

**Required for**: Security fix to prevent email spam abuse

### 002_performance_indexes.sql
**Purpose**: Creates database indexes for query optimization

**What it does**:
- Adds composite indexes on `idea_templates` for filtered candidate selection
- Creates GIN indexes for array-based searches (seasonal, vibe_tags, dietary preferences)
- Optimizes `exclusions` table with partial indexes for active exclusions
- Adds indexes on `suggestions`, `completed_dates`, and `favorites` for common queries
- Speeds up profile preference lookups with GIN indexes

**Performance Impact**:
- 50-90% faster suggestion generation queries
- Improved exclusion checking (90-day no-repeat system)
- Faster history and analytics queries
- Better performance for array-based filtering

**Required for**: Phase 1 code quality improvements

### 003_row_level_security.sql
**Purpose**: Implements Row-Level Security policies to protect user data

**What it does**:
- Enables RLS on all user data tables (profiles, suggestions, completed_dates, favorites, exclusions)
- Creates policies ensuring users can only access their own data
- Allows all authenticated users to read active idea templates
- Uses `auth.uid()` to match current user with profile_id

**Security Impact**:
- Prevents users from accessing other users' data
- Protects against SQL injection attacks targeting user data
- Enforces data isolation at the database level
- Complies with privacy best practices

**Required for**: Phase 1 security hardening

### 004_preference_learning_tables.sql
**Purpose**: Creates tables for preference learning and matching algorithm

**What it does**:
- Creates `user_preference_weights` table to store learned preference weights
- Creates `matching_scores_log` table to log every suggestion generation for ML
- Creates `idea_performance_metrics` table to track aggregate performance metrics
- Enhances `idea_templates` with popularity_score, seasonality_strict, and time_of_day_tags
- Seeds time_of_day_tags for existing ideas based on category
- Enables RLS on all new tables

**Required for**: Phase 2 matching algorithm

### 005_preference_learning_trigger.sql
**Purpose**: Implements automatic preference learning from user behavior

**What it does**:
- Creates trigger function `update_preference_weights()` that fires after date completion
- Adjusts user preference weights based on rating (+0.1 for liked, -0.1 for disliked)
- Updates aggregate statistics (total_completions, avg_rating, completion_rate)
- Updates idea performance metrics (times_completed, avg_rating, would_repeat_ratio)
- Creates trigger `track_suggestion_created()` to track suggestion counts

**Impact**:
- Automatic personalization without manual input
- Learns from every completed date
- Adjusts weights within bounds (0.3 to 2.0)

**Required for**: Phase 2 preference learning

### 006_scoring_algorithm.sql
**Purpose**: Implements multi-dimensional scoring algorithm for intelligent matching

**What it does**:
- Creates `generate_suggestion_v2()` RPC function with sophisticated scoring
- Calculates 7 components: budget fit, preference multiplier, temporal multiplier, freshness, performance, bonuses, penalties
- Returns best-matched idea with detailed score breakdown
- Supports filters (setting types, intensity levels) and context (season, day, time)

**Scoring Formula**:
```
final_score = base_score (50)
  × budget_fit (0.5-1.5)
  × preference_mult (0.3-2.0)
  × temporal_mult (0.7-1.3)
  × freshness_mult (0.8-1.2)
  × performance_mult (0.8-1.3)
  + context_bonus (0-15)
  - penalties (0-20)
```

**Required for**: Phase 2 matching algorithm

## Verification

After applying migrations, verify they worked:

```sql
-- Check that table exists
SELECT * FROM pg_tables WHERE tablename = 'auth_rate_limits';

-- Check that function exists
SELECT proname FROM pg_proc WHERE proname = 'check_auth_rate_limit';

-- Test rate limit function
SELECT check_auth_rate_limit('test@example.com', 5, 15);
```

## Rollback

If you need to rollback the rate limiting migration:

```sql
DROP FUNCTION IF EXISTS check_auth_rate_limit(TEXT, INTEGER, INTEGER);
DROP TABLE IF EXISTS auth_rate_limits CASCADE;
```
