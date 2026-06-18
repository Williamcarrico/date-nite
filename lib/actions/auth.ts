'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// Shape of the check_auth_rate_limit RPC response.
interface RateLimitResponse {
  allowed: boolean
  attempts: number
  max_attempts: number
  window_minutes: number
  retry_after_seconds?: number
}

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createClient()

  // SECURITY: Check rate limit before sending magic link.
  const { data: rateLimitData, error: rateLimitError } = await supabase
    .rpc('check_auth_rate_limit', {
      p_email: email.toLowerCase(),
      p_max_attempts: 5,
      p_window_minutes: 15,
    })

  const rateLimit = rateLimitData as RateLimitResponse | null

  if (rateLimitError) {
    // Fail CLOSED: this control exists to stop email-spam/cost abuse, so a
    // failed check must not silently grant unlimited attempts.
    console.error('[Rate Limit Check Error]:', rateLimitError)
    return { error: 'Unable to verify request right now. Please try again in a moment.' }
  }

  if (rateLimit && !rateLimit.allowed) {
    const retryMinutes = Math.ceil((rateLimit.retry_after_seconds || 900) / 60)
    return {
      error: `Too many login attempts. Please try again in ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''}.`,
      rateLimited: true,
    }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email for the magic link!' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}
