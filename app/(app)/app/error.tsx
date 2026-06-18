'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="border-0 shadow-lg max-w-md w-full">
        <CardContent className="pt-10 pb-10 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="gradient-primary text-white rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" asChild className="rounded-xl">
              <Link href="/app">
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
