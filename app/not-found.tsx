import { Button } from '@/components/ui/button'
import { Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page Not Found' }

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-playful">
          <Heart className="w-6 h-6 text-white fill-current" />
        </div>
        <span className="font-bold text-xl">Date Nite</span>
      </div>

      {/* 404 content */}
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gradient-primary mb-4">404</div>
        <h1 className="font-display text-3xl font-bold mb-3">This page ghosted you</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Looks like this page left without leaving a note. Don&apos;t worry — your perfect date idea is just a click away.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gradient-primary text-white rounded-xl h-12 px-6">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl h-12 px-6">
            <Link href="/app">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
