'use client'

import { m, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeUp, scaleIn, staggerContainer, EASE_OUT } from './variants'

/** Single-element entrance that fires once when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <m.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
    >
      {children}
    </m.div>
  )
}

/** Parent that staggers its <StaggerItem> children into view. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  const reduce = useReducedMotion()
  return (
    <m.div
      className={className}
      variants={staggerContainer(stagger)}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </m.div>
  )
}

/** Child of <StaggerGroup>. variant "up" (default) or "scale". */
export function StaggerItem({
  children,
  className,
  variant = 'up',
}: {
  children: ReactNode
  className?: string
  variant?: 'up' | 'scale'
}) {
  return (
    <m.div className={className} variants={variant === 'scale' ? scaleIn : fadeUp}>
      {children}
    </m.div>
  )
}
