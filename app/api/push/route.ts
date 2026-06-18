import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// web-push relies on Node's crypto APIs. Next 16 route handlers default to the
// Node.js runtime, so no explicit `runtime` export is needed (and it's
// incompatible with cacheComponents/PPR, which is enabled in next.config.ts).

interface NotificationRecord {
  id: string
  title: string
  body: string
  href: string | null
  recipient_id: string
}

interface PushSubscriptionRecord {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

/**
 * Constant-time comparison of the provided webhook secret against the
 * configured one. Returns false when either is missing or lengths differ
 * (timingSafeEqual requires equal-length buffers).
 */
function isAuthorized(provided: string | null): boolean {
  const expected = process.env.PUSH_WEBHOOK_SECRET
  if (!expected || !provided) return false

  const providedBuf = Buffer.from(provided)
  const expectedBuf = Buffer.from(expected)
  if (providedBuf.length !== expectedBuf.length) return false

  return crypto.timingSafeEqual(providedBuf, expectedBuf)
}

export async function POST(req: Request) {
  if (!isAuthorized(req.headers.get('x-webhook-secret'))) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: { notification_id?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const notificationId = body.notification_id
  if (!notificationId) {
    return new Response('Bad Request', { status: 400 })
  }

  // Gracefully no-op if VAPID is not configured rather than throwing.
  if (
    !process.env.VAPID_SUBJECT ||
    !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY
  ) {
    return Response.json({ skipped: 'vapid-unset' })
  }

  // Service-role client built inline — bypasses RLS for server-side fan-out.
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: notification } = await admin
    .from('notifications')
    .select('id, title, body, href, recipient_id')
    .eq('id', notificationId)
    .maybeSingle()

  const notif = notification as unknown as NotificationRecord | null
  if (!notif) {
    return new Response('Not Found', { status: 404 })
  }

  // Respect the recipient's push preference (missing key = enabled).
  const { data: profile } = await admin
    .from('profiles')
    .select('notification_prefs')
    .eq('id', notif.recipient_id)
    .maybeSingle()

  const prefs = (profile as unknown as { notification_prefs: Record<string, boolean> | null } | null)
    ?.notification_prefs

  if (prefs?.push_enabled === false) {
    return Response.json({ skipped: true })
  }

  const { data: subscriptions } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('profile_id', notif.recipient_id)

  const subs = (subscriptions ?? []) as unknown as PushSubscriptionRecord[]

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const payload = JSON.stringify({
    title: notif.title,
    body: notif.body,
    url: notif.href ?? '/app/notifications',
    tag: notificationId,
  })

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )
    )
  )

  let sent = 0
  const deadEndpoints: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      sent += 1
      return
    }

    const err = result.reason as { statusCode?: number }
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      deadEndpoints.push(subs[index].endpoint)
    }
  })

  // Prune dead endpoints so we stop trying to reach them.
  if (deadEndpoints.length > 0) {
    await admin
      .from('push_subscriptions')
      .delete()
      .in('endpoint', deadEndpoints)
  }

  return Response.json({ sent, pruned: deadEndpoints.length })
}
