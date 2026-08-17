/**
 * Auth constants shared between server actions and client forms.
 *
 * Kept out of `lib/actions/auth.ts` because a `'use server'` module may only
 * export async functions — exporting a plain const from there fails the build
 * (and neither tsc nor ESLint catches it).
 */
export const MIN_PASSWORD_LENGTH = 8
