'use client'

import { useEffect, useState } from 'react'
import NumberFlow, { type Format } from '@number-flow/react'

/**
 * Animated count-up. SSR-safe and reduced-motion-aware (NumberFlow honors
 * prefers-reduced-motion natively). Renders 0 on first paint, then rolls up to
 * `value` on mount — server and initial client render both start at 0, so there
 * is no hydration mismatch.
 */
export function CountUp({
  value,
  format,
  prefix,
  suffix,
  className,
}: {
  value: number
  format?: Format
  prefix?: string
  suffix?: string
  className?: string
}) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(value)
  }, [value])

  return (
    <NumberFlow
      value={n}
      format={format}
      prefix={prefix}
      suffix={suffix}
      className={className}
      willChange
    />
  )
}
