// Date Nite service worker — push notifications only (no caching / offline).

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const data = (() => {
    try {
      return event.data?.json() ?? {}
    } catch {
      return {}
    }
  })()

  event.waitUntil(
    self.registration.showNotification(data.title || 'Date Nite', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag,
      data: { url: data.url || '/app/notifications' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/app/notifications'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (new URL(client.url).origin === self.location.origin) {
            if ('navigate' in client) {
              return client.navigate(url).then((navigated) => {
                const target = navigated || client
                return 'focus' in target ? target.focus() : undefined
              })
            }
            return 'focus' in client ? client.focus() : undefined
          }
        }
        return self.clients.openWindow(url)
      })
  )
})
