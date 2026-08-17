'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { MIN_PASSWORD_LENGTH } from '@/lib/constants/auth'

/** Shape of the check_auth_rate_limit RPC response. */
interface RateLimitResponse {
  allowed: boolean
  attempts: number
  max_attempts: number
  window_minutes: number
  retry_after_seconds?: number
}

export interface AuthActionResult {
  error?: string
  message?: string
  rateLimited?: boolean
}

/**
 * Shared per-email throttle.
 *
 * Used for sign-in (slowing password guessing) and for anything that sends mail
 * (limiting spam and cost). Fails CLOSED: if the check itself errors we refuse
 * the attempt rather than silently granting unlimited tries.
 */
async function checkRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<AuthActionResult | null> {
  const { data, error } = await supabase.rpc('check_auth_rate_limit', {
    p_email: email.toLowerCase(),
    p_max_attempts: maxAttempts,
    p_window_minutes: windowMinutes,
  })

  if (error) {
    console.error('[Rate Limit Check Error]:', error)
    return { error: 'Unable to verify request right now. Please try again in a moment.' }
  }

  const rateLimit = data as RateLimitResponse | null
  if (rateLimit && !rateLimit.allowed) {
    const retryMinutes = Math.ceil((rateLimit.retry_after_seconds || 900) / 60)
    return {
      error: `Too many attempts. Please try again in ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''}.`,
      rateLimited: true,
    }
  }

  return null
}

/**
 * Public origin, preferring the request's own Origin header, then the
 * Vercel-forwarded host, then the configured app URL — so email links never
 * silently point at localhost in production.
 */
async function getOrigin(): Promise<string> {
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host')
  const forwardedProto = headersList.get('x-forwarded-proto') ?? 'https'

  return (
    headersList.get('origin') ||
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  )
}

function readCredentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  return { email, password }
}

/* -------------------------------------------------------------------------- */
/* Sign in                                                                    */
/* -------------------------------------------------------------------------- */

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const { email, password } = readCredentials(formData)

  if (!email || !password) {
    return { error: 'Email and password are both required.' }
  }

  const supabase = await createClient()

  // Higher ceiling than the email actions: a legitimate user mistyping their
  // password shouldn't be locked out, but this still blunts brute force.
  const limited = await checkRateLimit(supabase, email, 10, 15)
  if (limited) return limited

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Deliberately generic — distinguishing "wrong password" from "no such
    // account" tells an attacker which addresses are registered.
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Please confirm your email address before signing in.' }
    }
    return { error: 'That email and password combination didn’t work.' }
  }

  redirect('/app')
}

/* -------------------------------------------------------------------------- */
/* Sign up                                                                    */
/* -------------------------------------------------------------------------- */

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const { email, password } = readCredentials(formData)
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!email || !password) {
    return { error: 'Email and password are both required.' }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (password !== confirmPassword) {
    return { error: 'Those passwords don’t match.' }
  }

  const supabase = await createClient()

  const limited = await checkRateLimit(supabase, email, 5, 15)
  if (limited) return limited

  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/callback` },
  })

  if (error) {
    return { error: error.message }
  }

  // With email confirmation disabled, signUp returns a session and the user is
  // signed in immediately. With it enabled there's no session yet, so say so
  // rather than bouncing them to a page they can't load. Handling both means
  // this works whichever way the project is configured.
  if (data.session) {
    redirect('/app')
  }

  return {
    message:
      'Account created. Check your email for a confirmation link before signing in.',
  }
}

/* -------------------------------------------------------------------------- */
/* Password reset                                                             */
/* -------------------------------------------------------------------------- */

export async function requestPasswordReset(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createClient()

  const limited = await checkRateLimit(supabase, email, 5, 15)
  if (limited) return limited

  const origin = await getOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/callback?next=/reset-password`,
  })

  if (error) {
    console.error('[Password Reset Error]:', error.message)
  }

  // Always report success. Confirming whether an address is registered would
  // turn this form into an account-enumeration oracle.
  return {
    message: 'If that email has an account, a reset link is on its way.',
  }
}

export async function updatePassword(formData: FormData): Promise<AuthActionResult> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (password !== confirmPassword) {
    return { error: 'Those passwords don’t match.' }
  }

  const supabase = await createClient()

  // The recovery link established a session on the way in; without one there's
  // nothing to update.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: 'That reset link has expired. Request a fresh one and try again.',
    }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  redirect('/app')
}

/* -------------------------------------------------------------------------- */

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
