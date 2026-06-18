import { Suspense } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Suspense shields NotificationBell's new Date() from the PPR prerender pass */}
      <Suspense fallback={<div className="h-16 sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/50" />}>
        <AppHeader />
      </Suspense>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <Toaster position="bottom-right" />
    </div>
  )
}
