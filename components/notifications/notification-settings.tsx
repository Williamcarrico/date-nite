'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, BellRing, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePushNotifications } from '@/lib/push/use-push-notifications'
import { isIosNeedsInstall } from '@/lib/push/web-push'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/actions/notifications'
import { NOTIFICATION_TYPES } from '@/lib/notifications/types'

function usePushStatus() {
  const push = usePushNotifications()
  // Re-check iOS install state on the client only.
  const [iosNeedsInstall, setIosNeedsInstall] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only platform check; deferred to post-hydration to avoid an SSR/client mismatch
    setIosNeedsInstall(isIosNeedsInstall())
  }, [])
  return { ...push, iosNeedsInstall }
}

function PushCard() {
  const { supported, permission, subscribed, busy, subscribe, unsubscribe, iosNeedsInstall } =
    usePushStatus()

  const disabled = !supported || iosNeedsInstall || busy

  let status: string
  if (!supported) status = 'Not supported on this browser'
  else if (iosNeedsInstall) status = 'Add Date Nite to your Home Screen first to enable push'
  else if (permission === 'denied') status = 'Blocked — enable in browser settings'
  else if (subscribed) status = 'Enabled on this device'
  else status = 'Push notifications are off on this device'

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-primary" />
          Browser push notifications
        </CardTitle>
        <CardDescription>
          Get a push notification on this device even when Date Nite is closed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="push-master">Push on this device</Label>
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
          <div className="flex items-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Switch
              id="push-master"
              checked={subscribed}
              disabled={disabled}
              onCheckedChange={(value) => (value ? subscribe() : unsubscribe())}
              aria-label="Toggle browser push notifications"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TypePreferencesCard() {
  const [prefs, setPrefs] = useState<Record<string, boolean> | null>(null)

  useEffect(() => {
    let active = true
    getNotificationPreferences().then((data) => {
      if (active) setPrefs(data)
    })
    return () => {
      active = false
    }
  }, [])

  async function handleToggle(key: string, value: boolean) {
    const previous = prefs
    // Optimistic flip
    setPrefs((prev) => ({ ...(prev ?? {}), [key]: value }))

    const result = await updateNotificationPreferences({ [key]: value })
    if (result.success) {
      toast.success('Saved')
    } else {
      setPrefs(previous)
      toast.error(result.error ?? 'Could not save your preference')
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-secondary" />
          What to notify me about
        </CardTitle>
        <CardDescription>Choose which moments you want to hear about</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {prefs === null ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          NOTIFICATION_TYPES.map((type) => (
            <div key={type.key} className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor={`pref-${type.key}`}>{type.label}</Label>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
              <Switch
                id={`pref-${type.key}`}
                checked={prefs[type.key] ?? true}
                onCheckedChange={(value) => handleToggle(type.key, value)}
                aria-label={type.label}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <PushCard />
      <TypePreferencesCard />
    </div>
  )
}
