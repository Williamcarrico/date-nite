'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { requestPasswordReset } from '@/lib/actions/auth'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await requestPasswordReset(formData)

    setIsLoading(false)
    if (result.error) setError(result.error)
    else if (result.message) setMessage(result.message)
  }

  if (message) {
    return (
      <Card className="shadow-playful-lg border-0 animate-bounce-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            The link opens a page where you can choose a new password.
          </p>
          <Link href="/login">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              Back to sign in
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-playful-lg border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full gradient-secondary flex items-center justify-center mb-4 shadow-playful">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription className="text-base">
          We&apos;ll email you a link to choose a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </div>

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
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send reset link
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
