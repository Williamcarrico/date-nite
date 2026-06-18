'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signInWithMagicLink } from '@/lib/actions/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await signInWithMagicLink(formData)

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setEmailSent(true)
    }
  }

  if (emailSent) {
    return (
      <Card className="shadow-playful-lg border-0 animate-bounce-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-2xl">Check your email!</CardTitle>
          <CardDescription className="text-base">
            We sent you a magic link. Click it to sign in instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <Button
            variant="ghost"
            onClick={() => setEmailSent(false)}
            className="text-primary hover:text-primary/80"
          >
            Try a different email
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-playful-lg border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-playful">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Welcome back!</CardTitle>
        <CardDescription className="text-base">
          Sign in to continue planning amazing dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
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
                Sending magic link...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send magic link
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
