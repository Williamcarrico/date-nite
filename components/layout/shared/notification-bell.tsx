'use client'

import * as React from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  type?: 'info' | 'success' | 'warning'
}

interface NotificationBellProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllRead?: () => void
  className?: string
}

// Demo notifications for when none are provided
const demoNotifications: Notification[] = [
  {
    id: '1',
    title: 'Date night scheduled!',
    message: 'Your romantic dinner at The Olive Garden is confirmed for Friday.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    type: 'success',
  },
  {
    id: '2',
    title: 'New date idea for you',
    message: 'Based on your preferences, we found a sunset hike you might love.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    type: 'info',
  },
  {
    id: '3',
    title: 'Rate your last date',
    message: "How was your movie night? Let us know to improve your suggestions.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    type: 'info',
  },
]

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function NotificationBell({
  notifications = demoNotifications,
  onMarkAsRead,
  onMarkAllRead,
  className,
}: NotificationBellProps) {
  const [localNotifications, setLocalNotifications] = React.useState(notifications)
  const unreadCount = localNotifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    onMarkAsRead?.(id)
  }

  const handleMarkAllRead = () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    onMarkAllRead?.()
  }

  return (
    <Popover>
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
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {localNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll notify you about new date ideas and updates
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {localNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={cn(
                    'flex gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-muted/50',
                    !notification.read && 'bg-primary/5'
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'text-sm',
                          !notification.read && 'font-medium'
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {localNotifications.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
