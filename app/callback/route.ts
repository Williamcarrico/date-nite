import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  // SECURITY: Validate redirect path to prevent open redirect vulnerability
  // Only allow relative paths that don't start with //
  const isValidPath = next.startsWith('/') && !next.startsWith('//')
  const safePath = isValidPath ? next : '/app'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safePath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safePath}`)
      } else {
        return NextResponse.redirect(`${origin}${safePath}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
