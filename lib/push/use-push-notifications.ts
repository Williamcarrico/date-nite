'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  isIosNeedsInstall,
  isPushSupported,
  urlBase64ToUint8Array,
} from '@/lib/push/web-push'
import {
  deletePushSubscription,
  savePushSubscription,
} from '@/lib/actions/notifications'

interface UsePushNotifications {
  supported: boolean
  permission: NotificationPermission
  subscribed: boolean
  busy: boolean
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

/**
 * Client hook that exposes the browser's web-push state and the
 * subscribe/unsubscribe actions. On mount it only READS status — it never
 * prompts. `subscribe()` is the only place that calls
 * `Notification.requestPermission()`, and it must be invoked from a user
 * gesture (a click) per the spec.
 */
export function usePushNotifications(): UsePushNotifications {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    async function readStatus() {
      const isSupported = isPushSupported()
      if (!isSupported) {
        if (active) setSupported(false)
        return
      }

      if (active) {
        setSupported(true)
        setPermission(Notification.permission)
      }

      try {
        const reg = await navigator.serviceWorker.getRegistration()
        const sub = await reg?.pushManager.getSubscription()
        if (active) setSubscribed(!!sub)
      } catch {
        if (active) setSubscribed(false)
      }
    }

    readStatus()
    return () => {
      active = false
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!supported) {
      toast.error('Push notifications are not supported on this browser')
      return
    }
    if (isIosNeedsInstall()) {
      toast.error('Add Date Nite to your Home Screen first')
      return
    }
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      toast.error('Push not configured')
      return
    }

    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        toast.error('Notifications permission was not granted')
        return
      }

      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          ) as BufferSource,
        }))

      const result = await savePushSubscription(
        sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } },
        navigator.userAgent
      )

      if (!result.success) {
        toast.error(result.error ?? 'Could not save your subscription')
        return
      }

      setSubscribed(true)
      toast.success('Push notifications enabled on this device')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not enable push notifications'
      )
    } finally {
      setBusy(false)
    }
  }, [supported])

  const unsubscribe = useCallback(async () => {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()

      if (!sub) {
        setSubscribed(false)
        return
      }

      const endpoint = sub.endpoint
      await sub.unsubscribe()
      await deletePushSubscription(endpoint)
      setSubscribed(false)
      toast.success('Push notifications disabled on this device')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not disable push notifications'
      )
    } finally {
      setBusy(false)
    }
  }, [])

  return { supported, permission, subscribed, busy, subscribe, unsubscribe }
}
