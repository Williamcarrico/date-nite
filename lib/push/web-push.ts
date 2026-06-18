/**
 * Convert a base64url-encoded VAPID public key into the Uint8Array that
 * PushManager.subscribe expects as `applicationServerKey`.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Whether the current browser supports the Web Push APIs we rely on.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * True when running in iOS Safari that is NOT installed to the home screen.
 * iOS only allows web push from an installed PWA, so the UI should prompt the
 * user to "Add to Home Screen" first.
 */
export function isIosNeedsInstall(): boolean {
  if (typeof window === 'undefined') return false

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  if (!isIos) return false

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true

  return !isStandalone
}
