import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Email auth callback.
 *
 * Handles both shapes a Supabase email link can arrive in:
 *
 * 1. `?token_hash=...&type=...` — verified with `verifyOtp`. This is the
 *    device-independent path and the one to prefer: it carries no PKCE code
 *    verifier, so the link works even when the email is opened in a different
 *    browser than the one that requested it (a phone, or a mail client's
 *    in-app webview, which has its own cookie jar).
 * 2. `?code=...` — the PKCE flow, exchanged with `exchangeCodeForSession`.
 *    Only works in the same browser that requested the link, because the code
 *    verifier lives in a cookie there. Requesting a second link overwrites that
 *    verifier and invalidates every earlier link.
 *
 * Any failure redirects to /login with a human-readable `?error=`, which the
 * login page renders. Failing silently here is what turns one bad link into an
 * apparent infinite loop: the user sees a blank sign-in form, requests another
 * link, and that request invalidates the verifier again.
 */

const OTP_TYPES = new Set<string>([
  'magiclink',
  'signup',
  'invite',
  'recovery',
  'email_change',
  'email',
])

function isEmailOtpType(value: string): value is EmailOtpType {
  return OTP_TYPES.has(value)
}

/** Map Supabase's terse auth errors onto something a person can act on. */
function friendlyMessage(raw: string): string {
  const message = raw.toLowerCase()

  if (message.includes('code verifier') || message.includes('code challenge')) {
    return 'That link was from an older request. Please use the most recent email, or send a fresh link below.'
  }
  if (message.includes('expired') || message.includes('not found') || message.includes('invalid')) {
    return 'That sign-in link has expired or was already used. Send yourself a fresh one below.'
  }
  return raw
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/app'

  // SECURITY: Validate redirect path to prevent open redirect vulnerability.
  // Only allow relative paths that don't start with //
  const isValidPath = next.startsWith('/') && !next.startsWith('//')
  const safePath = isValidPath ? next : '/app'

  const failure = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`)

  // Supabase reports link-level problems (expired, already consumed) on the
  // redirect itself rather than as a failed exchange.
  const providerError = searchParams.get('error_description') ?? searchParams.get('error')
  if (providerError) {
    return failure(friendlyMessage(providerError))
  }

  const supabase = await createClient()

  // Prefer token_hash when it's usable; fall back to the PKCE code. Checked
  // explicitly rather than as a ternary so a token_hash with a missing or
  // unrecognized `type` can't fall through into an exchange with a null code.
  let error
  if (tokenHash && type && isEmailOtpType(type)) {
    ;({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }))
  } else if (code) {
    ;({ error } = await supabase.auth.exchangeCodeForSession(code))
  } else {
    return failure(
      'That sign-in link was missing its token. Send yourself a fresh one below.'
    )
  }

  if (error) {
    console.error('[auth callback]:', error.message)
    return failure(friendlyMessage(error.message))
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (isLocalEnv || !forwardedHost) {
    return NextResponse.redirect(`${origin}${safePath}`)
  }
  return NextResponse.redirect(`https://${forwardedHost}${safePath}`)
}
