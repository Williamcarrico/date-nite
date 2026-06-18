'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/components/providers/notification-provider'
import { getNotificationVisual } from '@/components/notifications/icon-map'
import { RelativeTime } from '@/components/notifications/relative-time'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const { items, unreadCount, loading, markAsRead, markAllRead } = useNotifications()

  // Keep the popover preview short; the dedicated page shows everything.
  const preview = items.slice(0, 8)

  async function handleItemClick(id: string, href: string | null) {
    await markAsRead(id)
    if (href) {
      setOpen(false)
      router.push(href)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative rounded-xl', className)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive animate-notification-ping" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 rounded-xl shadow-playful-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllRead()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : preview.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll notify you about new date ideas and updates
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {preview.map((item) => {
                const { Icon, chip } = getNotificationVisual(item.type)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      'flex gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-muted/50',
                      !item.read && 'bg-primary/5'
                    )}
                    onClick={() => handleItemClick(item.id, item.href)}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        chip
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm', !item.read && 'font-medium')}>
                          {item.title}
                        </p>
                        {!item.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.message}
                      </p>
                      <RelativeTime iso={item.createdAtISO} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" className="w-full rounded-xl" onClick={() => setOpen(false)}>
            <Link href="/app/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
