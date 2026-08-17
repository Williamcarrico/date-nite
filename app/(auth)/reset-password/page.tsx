'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowRight, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordField } from '@/components/auth/password-field'
import { updatePassword } from '@/lib/actions/auth'
import { MIN_PASSWORD_LENGTH } from '@/lib/constants/auth'

/**
 * Reached via the recovery link, which the auth callback exchanges for a
 * session before redirecting here. The session is what authorizes the update —
 * `updatePassword` refuses if there isn't one.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordForm initialError={null} />}>
      <ResetPasswordFormWithError />
    </Suspense>
  )
}

function ResetPasswordFormWithError() {
  const searchParams = useSearchParams()
  return <ResetPasswordForm initialError={searchParams.get('error')} />
}

function ResetPasswordForm({ initialError }: { initialError: string | null }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    // On success the action redirects to /app.
    const result = await updatePassword(formData)

    setIsLoading(false)
    if (result?.error) setError(result.error)
  }

  return (
    <Card className="shadow-playful-lg border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-playful">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
        <CardDescription className="text-base">
          You&apos;ll be signed in as soon as it&apos;s saved
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <PasswordField
            id="password"
            name="password"
            label="New password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          />

          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
          />

          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl gradient-primary hover:opacity-90 transition-opacity text-white font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Save password
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need a new link?{' '}
            <Link href="/forgot-password" className="text-primary hover:underline font-medium">
              Request one
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
