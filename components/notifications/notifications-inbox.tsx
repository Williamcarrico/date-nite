'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { m } from 'motion/react'
import { isToday, isYesterday } from 'date-fns'
import { Bell, CheckCheck, Loader2, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/components/providers/notification-provider'
import { getNotificationVisual } from '@/components/notifications/icon-map'
import { RelativeTime } from '@/components/notifications/relative-time'
import type { NotificationItem } from '@/lib/notifications/types'

type Group = { key: string; label: string; items: NotificationItem[] }

function groupByDate(items: NotificationItem[]): Group[] {
  const today: NotificationItem[] = []
  const yesterday: NotificationItem[] = []
  const earlier: NotificationItem[] = []

  for (const item of items) {
    const date = new Date(item.createdAtISO)
    if (isToday(date)) today.push(item)
    else if (isYesterday(date)) yesterday.push(item)
    else earlier.push(item)
  }

  const groups: Group[] = []
  if (today.length) groups.push({ key: 'today', label: 'Today', items: today })
  if (yesterday.length) groups.push({ key: 'yesterday', label: 'Yesterday', items: yesterday })
  if (earlier.length) groups.push({ key: 'earlier', label: 'Earlier', items: earlier })
  return groups
}

export function NotificationsInbox() {
  const router = useRouter()
  const {
    items,
    unreadCount,
    loading,
    hasMore,
    busy,
    markAsRead,
    markAllRead,
    remove,
    loadMore,
  } = useNotifications()

  const groups = useMemo(() => groupByDate(items), [items])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay in the loop on matches, dates, and surprises
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl text-muted-foreground hover:text-foreground"
            disabled={unreadCount === 0}
            onClick={() => markAllRead()}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
          <Button asChild variant="ghost" size="icon" className="rounded-xl" aria-label="Notification settings">
            <Link href="/app/notifications/settings">
              <Settings className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No notifications yet</h3>
          <p className="text-muted-foreground max-w-sm">
            We&apos;ll let you know about new matches, scheduled dates, and surprises here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.key} className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                {group.label}
              </h2>
              <ul className="space-y-2">
                {group.items.map((item) => {
                  const { Icon, chip } = getNotificationVisual(item.type)
                  return (
                    <m.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative"
                    >
                      <button
                        type="button"
                        onClick={async () => {
                          await markAsRead(item.id)
                          if (item.href) router.push(item.href)
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 pr-12 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                          !item.read && 'bg-primary/5'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            chip
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="flex-1 space-y-1">
                          <span className="flex items-start gap-2">
                            <span className={cn('text-sm', !item.read && 'font-semibold')}>
                              {item.title}
                            </span>
                            {!item.read && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            {item.message}
                          </span>
                          <RelativeTime iso={item.createdAtISO} />
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Delete notification"
                        onClick={() => remove(item.id)}
                        className="absolute right-2 top-2 h-8 w-8 rounded-xl text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </m.li>
                  )
                })}
              </ul>
            </section>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={busy}
                onClick={() => loadMore()}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading…
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
