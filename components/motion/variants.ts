import type { Variants } from 'motion/react'

// House easing used across the app (pick-deck, match-reveal).
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
}

export const staggerContainer = (stagger = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
})

// Subtle hover lift for cards (use with whileHover="hover").
export const cardHover: Variants = {
  rest: { y: 0 },
  hover: { y: -4, transition: { duration: 0.2, ease: EASE_OUT } },
}
