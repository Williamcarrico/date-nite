'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface RelativeTimeProps {
  iso: string
  className?: string
}

/**
 * Renders a timestamp relative to now (e.g. "3 minutes ago"). To avoid the
 * hydration mismatch the (app) layout warns about, the first paint shows a
 * stable absolute date (computed the same way on server and client), and the
 * relative phrasing is filled in inside an effect — which only runs on the
 * client, after hydration.
 */
export function RelativeTime({ iso, className }: RelativeTimeProps) {
  // Initialized WITHOUT a relative calc so SSR and the first client render match.
  const [label, setLabel] = useState(() => new Date(iso).toLocaleDateString())

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration swap to a client-only relative label (avoids SSR mismatch)
    setLabel(formatDistanceToNow(new Date(iso), { addSuffix: true }))
  }, [iso])

  return (
    <time dateTime={iso} className={cn('text-xs text-muted-foreground', className)}>
      {label}
    </time>
  )
}
