import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NotificationSettings } from '@/components/notifications/notification-settings'

export const metadata: Metadata = { title: 'Notification settings' }

export default function NotificationSettingsPage() {
  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/app/notifications"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notifications
        </Link>
        <h1 className="font-display text-3xl font-bold">Notification settings</h1>
        <p className="text-muted-foreground mt-1">
          Control how and when Date Nite reaches you
        </p>
      </div>

      <NotificationSettings />
    </section>
  )
}
