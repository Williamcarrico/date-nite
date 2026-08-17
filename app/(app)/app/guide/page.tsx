import type { Metadata } from 'next'
import { BookOpen, Clock3, MessageCircleQuestion } from 'lucide-react'
import { GUIDE_PARTS, GUIDE_READING_MINUTES, GUIDE_TOC } from '@/lib/constants/guide'
import { GuidePartSection } from '@/components/guide/guide-part'
import { GuideTocMobile, GuideTocRail } from '@/components/guide/guide-toc'

export const metadata: Metadata = {
  title: 'The First Date Guide',
  description:
    'A working manual for first dates: venue selection, a 110-question conversation bank, reading signals, verbatim scripts, and pre-date checklists.',
}

/**
 * Fully static. Deliberately does no Supabase work — `proxy.ts` already gates
 * `/app/*`, and with `cacheComponents` on, an uncached dynamic read here would
 * turn a build-time-prerendered document into a per-request render.
 */
export const cacheComponents = true

const STATS = [
  { icon: BookOpen, label: '12 parts' },
  { icon: MessageCircleQuestion, label: '110 questions' },
  { icon: Clock3, label: `${GUIDE_READING_MINUTES} min read` },
]

export default function GuidePage() {
  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-12">
      <article className="max-w-[68ch] pb-20 xl:mx-0">
        <header className="pb-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
            Field manual
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mt-3 text-balance">
            The First Date <span className="text-gradient-primary">Guide</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            A working manual, not inspiration. Mechanics, verbatim scripts, and numbers — from the
            ask-out text to the follow-up the next morning.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {STATS.map((stat) => (
              <li
                key={stat.label}
                className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-muted-foreground"
              >
                <stat.icon className="size-3.5" aria-hidden="true" />
                {stat.label}
              </li>
            ))}
          </ul>
        </header>

        <GuideTocMobile parts={GUIDE_TOC} />

        {GUIDE_PARTS.map((part) => (
          <GuidePartSection key={part.id} part={part} />
        ))}

        <footer className="mt-16 border-t border-border pt-6 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Read Part 05 the night before · Part 11 in the parking lot
        </footer>
      </article>

      <GuideTocRail parts={GUIDE_TOC} />
    </div>
  )
}
