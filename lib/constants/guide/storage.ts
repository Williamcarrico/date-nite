/**
 * Kept in its own module so the client-side checklist can import the key without
 * pulling in `lib/constants/guide/index.ts`, which loads all twelve parts of the
 * guide (~15,000 words) and must never reach the browser bundle.
 *
 * Versioned: bump the suffix to invalidate saved state if item ids ever change.
 */
export const GUIDE_CHECKLIST_STORAGE_KEY = 'datenite:guide-checklist:v1'
