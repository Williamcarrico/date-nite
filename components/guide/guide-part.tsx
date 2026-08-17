import type { GuidePart } from '@/lib/constants/guide/types'
import { Reveal } from '@/components/motion/reveal'
import { GuideBlocks } from './guide-blocks'
import { GuideIcon } from './guide-icon-map'

/**
 * One numbered part. Entrance animation is deliberately limited to the header —
 * wrapping the ~700 content blocks would create ~700 IntersectionObservers.
 */
export function GuidePartSection({ part }: { part: GuidePart }) {
  return (
    <section id={part.id} className="scroll-mt-20 pt-12 first:pt-4">
      <Reveal>
        <div className="border-t-2 border-foreground/80 pt-4">
          <div className="flex items-center gap-2.5">
            <GuideIcon name={part.icon} className="size-4 text-primary" />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-primary tabular-nums">
              Part {String(part.number).padStart(2, '0')}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight mt-2 text-balance">
            {part.title}
          </h2>
          <p className="mt-2 text-muted-foreground text-balance">{part.summary}</p>
        </div>
      </Reveal>

      <div className="mt-6">
        <GuideBlocks blocks={part.blocks} />
      </div>
    </section>
  )
}
