'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signInWithMagicLink } from '@/lib/actions/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Heart, Mail, ArrowRight, CheckCircle2, Sparkles, Calendar, Star, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
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
            We sent you a magic link. Click it to create your account instantly!
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
    <div className="space-y-6">
      {/* Features preview */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-card shadow-sm">
          <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs font-medium">Unique Ideas</p>
        </div>
        <div className="p-3 rounded-2xl bg-card shadow-sm">
          <div className="w-10 h-10 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-xs font-medium">Easy Scheduling</p>
        </div>
        <div className="p-3 rounded-2xl bg-card shadow-sm">
          <div className="w-10 h-10 mx-auto rounded-xl bg-accent/10 flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-accent" />
          </div>
          <p className="text-xs font-medium">Rate & Track</p>
        </div>
      </div>

      <Card className="shadow-playful-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full gradient-secondary flex items-center justify-center mb-4 shadow-playful">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription className="text-base">
            Start discovering amazing date ideas in seconds
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
