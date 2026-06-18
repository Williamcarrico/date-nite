-- The profile form collects "Favorite Categories" (ProfileFormData.favorite_categories
-- in lib/actions/profile.ts) but the column was missing, so saving a profile with
-- categories failed: "Could not find the 'favorite_categories' column of 'profiles'
-- in the schema cache". Add it to match the other array preference columns.  APPLIED 2026-06.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_categories TEXT[] DEFAULT '{}'::text[];
NOTIFY pgrst, 'reload schema';
