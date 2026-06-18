'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead as markAsReadAction,
} from '@/lib/actions/notifications'
import { mapRow, type NotificationItem, type NotificationRow } from '@/lib/notifications/types'

const PAGE_SIZE = 20

interface NotificationContextValue {
  items: NotificationItem[]
  unreadCount: number
  loading: boolean
  hasMore: boolean
  busy: boolean
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return ctx
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [busy, setBusy] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const [uid, setUid] = useState<string | null>(null)

  // Keep the latest items in a ref so loadMore/remove don't need `items` in
  // their dependency arrays (which would otherwise recreate callbacks and could
  // churn effects). The realtime channel reads nothing from this ref.
  const itemsRef = useRef<NotificationItem[]>([])
  itemsRef.current = items

  const announce = useCallback((text: string) => {
    // Reset then set so identical consecutive titles still re-announce.
    setAnnouncement('')
    requestAnimationFrame(() => setAnnouncement(text))
  }, [])

  // Resolve the current user once on mount, and keep it in sync with auth state.
  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (active) setUid(data.user?.id ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUid(null)
        setItems([])
        setUnreadCount(0)
        setHasMore(false)
        setLoading(false)
        return
      }
      setUid(session?.user?.id ?? null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Initial load + realtime subscription. Depends only on `uid` to avoid
  // resubscribe loops. No user → no fetch, no channel, loading resolves to false.
  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    Promise.all([getNotifications(PAGE_SIZE, 0), getUnreadCount()])
      .then(([rows, count]) => {
        if (!active) return
        setItems(rows.map(mapRow))
        setUnreadCount(count)
        setHasMore(rows.length === PAGE_SIZE)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${uid}`,
        },
        (payload) => {
          const item = mapRow(payload.new as NotificationRow)
          setItems((prev) => [item, ...prev])
          setUnreadCount((count) => count + 1)
          toast(item.title, {
            description: item.message,
            action: item.href
              ? { label: 'View', onClick: () => router.push(item.href!) }
              : undefined,
          })
          announce(item.title)
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [uid, router, announce])

  const refresh = useCallback(async () => {
    if (!uid) return
    setLoading(true)
    try {
      const [rows, count] = await Promise.all([
        getNotifications(PAGE_SIZE, 0),
        getUnreadCount(),
      ])
      setItems(rows.map(mapRow))
      setUnreadCount(count)
      setHasMore(rows.length === PAGE_SIZE)
    } finally {
      setLoading(false)
    }
  }, [uid])

  const markAsRead = useCallback(async (id: string) => {
    const target = itemsRef.current.find((n) => n.id === id)
    if (!target || target.read) return

    // Optimistic
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((count) => Math.max(0, count - 1))

    const result = await markAsReadAction(id)
    if (!result.success) {
      // Revert
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
      setUnreadCount((count) => count + 1)
      toast.error(result.error ?? 'Could not mark as read')
    }
  }, [])

  const markAllRead = useCallback(async () => {
    const prevItems = itemsRef.current
    const prevUnread = prevItems.filter((n) => !n.read).length
    if (prevUnread === 0) return

    // Optimistic
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)

    const result = await markAllAsRead()
    if (!result.success) {
      setItems(prevItems)
      setUnreadCount(prevUnread)
      toast.error(result.error ?? 'Could not mark all as read')
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    const prevItems = itemsRef.current
    const target = prevItems.find((n) => n.id === id)
    if (!target) return
    const wasUnread = !target.read

    // Optimistic splice
    setItems((prev) => prev.filter((n) => n.id !== id))
    if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1))

    const result = await deleteNotification(id)
    if (!result.success) {
      setItems(prevItems)
      if (wasUnread) setUnreadCount((count) => count + 1)
      toast.error(result.error ?? 'Could not delete notification')
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (busy) return
    setBusy(true)
    try {
      const offset = itemsRef.current.length
      const rows = await getNotifications(PAGE_SIZE, offset)
      const newItems = rows.map(mapRow)
      // Guard against duplicates that may have arrived via realtime.
      setItems((prev) => {
        const seen = new Set(prev.map((n) => n.id))
        return [...prev, ...newItems.filter((n) => !seen.has(n.id))]
      })
      setHasMore(rows.length === PAGE_SIZE)
    } finally {
      setBusy(false)
    }
  }, [busy])

  return (
    <NotificationContext.Provider
      value={{
        items,
        unreadCount,
        loading,
        hasMore,
        busy,
        markAsRead,
        markAllRead,
        remove,
        loadMore,
        refresh,
      }}
    >
      {children}
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>
    </NotificationContext.Provider>
  )
}
