import { slugify } from './slug'

/**
 * `scroll-mt-20` clears the sticky 64px app header — without it every in-page
 * anchor jump lands underneath it.
 */
export function GuideHeading({
  level,
  text,
  id,
}: {
  level: 3 | 4
  text: string
  id?: string
}) {
  const anchor = id ?? slugify(text)

  if (level === 3) {
    return (
      <h3
        id={anchor}
        className="scroll-mt-20 font-display text-xl sm:text-2xl font-bold mt-10 mb-3 text-foreground"
      >
        {text}
      </h3>
    )
  }

  return (
    <h4
      id={anchor}
      className="scroll-mt-20 mt-7 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"
    >
      {text}
    </h4>
  )
}
