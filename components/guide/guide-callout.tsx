import { Compass, Lightbulb, ShieldAlert, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { GuideCalloutTone, GuideLeafBlock } from '@/lib/constants/guide/types'
import { GuideLeafBlocks } from './guide-leaf-blocks'

/**
 * Static class map — Tailwind can't see interpolated class names, so tones must
 * be looked up, never built (same approach as `components/landing/feature-cards.tsx`).
 */
const TONE = {
  rule: {
    wrap: 'border-primary/25 bg-primary/5',
    title: 'text-primary',
    icon: Compass,
  },
  insight: {
    wrap: 'border-secondary/25 bg-secondary/5',
    title: 'text-secondary',
    icon: Lightbulb,
  },
  warning: {
    wrap: 'border-warning/30 bg-warning/5',
    title: 'text-warning',
    icon: TriangleAlert,
  },
  safety: {
    wrap: 'border-success/30 bg-success/5',
    title: 'text-success',
    icon: ShieldAlert,
  },
} as const satisfies Record<
  GuideCalloutTone,
  { wrap: string; title: string; icon: LucideIcon }
>

export function GuideCallout({
  tone,
  title,
  blocks,
}: {
  tone: GuideCalloutTone
  title?: string
  blocks: readonly GuideLeafBlock[]
}) {
  const style = TONE[tone]
  const Icon = style.icon

  return (
    <aside className={`my-6 rounded-2xl border p-5 shadow-sm ${style.wrap}`}>
      {title ? (
        <p
          className={`mb-2 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${style.title}`}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {title}
        </p>
      ) : null}
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <GuideLeafBlocks blocks={blocks} />
      </div>
    </aside>
  )
}
