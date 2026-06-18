import type { Metadata } from 'next'
import { NotificationsInbox } from '@/components/notifications/notifications-inbox'

export const metadata: Metadata = { title: 'Notifications' }

export default function NotificationsPage() {
  return (
    <section className="max-w-2xl mx-auto">
      <NotificationsInbox />
    </section>
  )
}
