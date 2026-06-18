# Type Generation Guide

This guide explains how to regenerate TypeScript types from the Supabase database schema to eliminate type casting workarounds.

## Prerequisites

1. All migrations must be applied to Supabase:
   - `001_rate_limiting.sql`
   - `002_performance_indexes.sql`
   - `003_row_level_security.sql`

2. Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

3. Logged in to Supabase CLI:
   ```bash
   supabase login
   ```

## Step 1: Apply Migrations

If you haven't already, apply all pending migrations:

### Option A: Using Supabase CLI
```bash
cd /Users/williamcarrico/date-nite
supabase db push
```

### Option B: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and execute each migration file in order:
   - `supabase/migrations/001_rate_limiting.sql`
   - `supabase/migrations/002_performance_indexes.sql`
   - `supabase/migrations/003_row_level_security.sql`

### Option C: Direct SQL (if you have database access)
```bash
psql $DATABASE_URL < supabase/migrations/001_rate_limiting.sql
psql $DATABASE_URL < supabase/migrations/002_performance_indexes.sql
psql $DATABASE_URL < supabase/migrations/003_row_level_security.sql
```

## Step 2: Generate TypeScript Types

Generate fresh types from your database schema:

```bash
# Using Supabase CLI with project reference
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# OR if linked to local project
supabase gen types typescript --local > types/database.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (found in project settings).

## Step 3: Remove Type Casting Workarounds

After generating types, update these files to remove `as unknown as` and `as any` casting:

### File: `lib/actions/auth.ts` (Line 31)

**Current (with workaround)**:
```typescript
interface RateLimitResponse {
  allowed: boolean
  attempts: number
  max_attempts: number
  window_minutes: number
  retry_after_seconds?: number
}

const { data: rateLimitData, error: rateLimitError } = await supabase
  .rpc('check_auth_rate_limit', {
    p_email: email.toLowerCase(),
    p_max_attempts: 5,
    p_window_minutes: 15
  } as any) as { data: RateLimitResponse | null, error: any }
```

**After type generation**:
```typescript
// Remove the interface - it's now in Database types
// Remove the type assertion
const { data: rateLimitData, error: rateLimitError } = await supabase
  .rpc('check_auth_rate_limit', {
    p_email: email.toLowerCase(),
    p_max_attempts: 5,
    p_window_minutes: 15
  })

// Type will be automatically inferred from Database['public']['Functions']['check_auth_rate_limit']
```

### File: `lib/actions/profile.ts` (Lines 53, 117)

**Current**:
```typescript
return data as unknown as ProfileData
return data as unknown as ProfileStats
```

**After**:
```typescript
// Use generated Database type
return data
// Types will be inferred from the select query
```

### File: `lib/actions/suggestions.ts` (Lines 164, 373)

**Current**:
```typescript
const data = rawData as unknown as SuggestionResult
const data = suggestionData as unknown as SuggestionWithTemplate
```

**After**:
```typescript
// Remove casting - types inferred from select with joins
const data = rawData
const data = suggestionData
```

### File: `app/favorites/page.tsx` (Line 42)

**Current**:
```typescript
return (data as unknown as FavoriteWithTemplate[]) || []
```

**After**:
```typescript
return data || []
```

### File: `app/(marketing)/app/page.tsx` (Lines 64, 80)

**Current**:
```typescript
return data as unknown as UpcomingDate | null
return (data as unknown as RecentSuggestion[]) || []
```

**After**:
```typescript
return data
return data || []
```

## Step 4: Update Type Imports

Update all files to import types from the generated file:

```typescript
import type { Database } from '@/types/database'

// Example: Access table types
type Profile = Database['public']['Tables']['profiles']['Row']
type Suggestion = Database['public']['Tables']['suggestions']['Row']

// Example: Access function return types
type RateLimitResult = Database['public']['Functions']['check_auth_rate_limit']['Returns']
```

## Step 5: Verify Build

After removing type casting, verify the build still compiles:

```bash
npm run build
```

If there are type errors, the generated types may need manual adjustments for complex joins or RPC functions.

## Common Issues

### Issue: RPC function types not generated correctly

Some complex JSONB return types from Postgres functions may not generate perfectly.

**Solution**: Keep the inline interface but rename it to avoid conflicts:
```typescript
// Fallback if generated type is incomplete
interface CheckAuthRateLimitResult {
  allowed: boolean
  attempts: number
  max_attempts: number
  window_minutes: number
  retry_after_seconds?: number
}
```

### Issue: Join types are overly complex

Supabase type generation may create deeply nested types for joins.

**Solution**: Create simplified type aliases:
```typescript
import type { Database } from '@/types/database'

type SuggestionRow = Database['public']['Tables']['suggestions']['Row']
type IdeaTemplateRow = Database['public']['Tables']['idea_templates']['Row']

interface SuggestionWithTemplate extends SuggestionRow {
  idea_templates: IdeaTemplateRow
}
```

## Type Generation Best Practices

1. **Regenerate after every schema change**: Run `supabase gen types` after any migration
2. **Commit generated types**: Include `types/database.ts` in version control
3. **Use type helpers**: Create utility types for common query patterns
4. **Document custom types**: If you need manual interfaces, document why they're needed

## Verification Checklist

After completing type generation:

- [ ] All migrations applied successfully
- [ ] Types generated without errors
- [ ] All `as unknown as` removed (or documented as intentional)
- [ ] All `as any` removed (or documented as intentional)
- [ ] Build passes with `npm run build`
- [ ] TypeScript strict mode passes
- [ ] No regression in functionality

## Next Steps

Once types are generated and verified:

1. Update the database types import in `lib/supabase/server.ts` and `lib/supabase/client.ts`
2. Remove all temporary interfaces that duplicate generated types
3. Add JSDoc comments referencing generated types for better IDE support
4. Consider using Zod or similar for runtime validation of API responses

---

**Note**: This guide assumes you're using Supabase's hosted platform. If using a self-hosted Postgres instance, you may need alternative type generation tools like `pg-typegen` or `kysely-codegen`.
