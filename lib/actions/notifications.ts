'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  DEFAULT_PREFS,
  NOTIFICATION_TYPES,
  PUSH_PREF_KEY,
  type NotificationRow,
} from '@/lib/notifications/types'

// Valid preference keys: every notification type plus the push toggle.
const PREF_KEYS = new Set<string>([
  ...NOTIFICATION_TYPES.map((t) => t.key),
  PUSH_PREF_KEY,
])

// A partial map of preference keys -> boolean. Refinement rejects any key that
// is not a known notification type / push toggle (z.record's value type already
// enforces booleans). Partial (and empty) maps are intentionally allowed.
const preferencesSchema = z
  .record(z.string(), z.boolean())
  .refine((obj) => Object.keys(obj).every((key) => PREF_KEYS.has(key)), {
    message: 'Invalid notification preference key',
  })

export async function getNotifications(
  limit = 20,
  offset = 0
): Promise<NotificationRow[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return (data ?? []) as unknown as NotificationRow[]
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('read', false)

  return count ?? 0
}

export async function markAsRead(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // RLS enforces ownership — scoping to the row id is sufficient.
  const { error } = await supabase
    .from('notifications')
    .update({ read: true } as never)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/app/notifications')
  revalidatePath('/app')

  return { success: true }
}

export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true } as never)
    .eq('recipient_id', user.id)
    .eq('read', false)

  if (error) return { success: false, error: error.message }

  revalidatePath('/app/notifications')
  revalidatePath('/app')

  return { success: true }
}

export async function deleteNotification(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // RLS enforces ownership.
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/app/notifications')
  revalidatePath('/app')

  return { success: true }
}

export async function savePushSubscription(
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        profile_id: user.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_agent: userAgent ?? null,
      } as never,
      { onConflict: 'endpoint' }
    )

  if (error) return { success: false, error: error.message }

  return { success: true }
}

export async function deletePushSubscription(
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
    .eq('profile_id', user.id)

  if (error) return { success: false, error: error.message }

  return { success: true }
}

export async function getNotificationPreferences(): Promise<Record<string, boolean>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ...DEFAULT_PREFS }

  const { data } = await supabase
    .from('profiles')
    .select('notification_prefs')
    .eq('id', user.id)
    .maybeSingle()

  const stored = (data as unknown as { notification_prefs: Record<string, boolean> | null } | null)
    ?.notification_prefs

  return { ...DEFAULT_PREFS, ...(stored ?? {}) }
}

export async function updateNotificationPreferences(
  partial: Record<string, boolean>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const validated = preferencesSchema.safeParse(partial)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  // Read the current prefs and shallow-merge the validated partial.
  const { data } = await supabase
    .from('profiles')
    .select('notification_prefs')
    .eq('id', user.id)
    .maybeSingle()

  const current = (data as unknown as { notification_prefs: Record<string, boolean> | null } | null)
    ?.notification_prefs ?? {}

  const merged = { ...current, ...validated.data }

  const { error } = await supabase
    .from('profiles')
    .update({ notification_prefs: merged } as never)
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/app/notifications/settings')

  return { success: true }
}
