'use client'

import { useEffect, useState } from 'react'
import { List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export type GuideTocEntry = {
  id: string
  number: number
  title: string
}

/**
 * Tracks the part currently in view. One IntersectionObserver over 12 nodes —
 * no scroll listener, no rAF, no layout reads. The negative bottom margin means
 * a section only counts as active once it's in the top third of the viewport.
 */
function useActivePart(parts: readonly GuideTocEntry[]) {
  const [activeId, setActiveId] = useState<string>(parts[0]?.id ?? '')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const topMost = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (topMost) setActiveId(topMost.target.id)
      },
      // -80px clears the sticky app header.
      { rootMargin: '-80px 0px -70% 0px' }
    )

    for (const part of parts) {
      const el = document.getElementById(part.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [parts])

  return activeId
}

function TocList({
  parts,
  activeId,
  onNavigate,
}: {
  parts: readonly GuideTocEntry[]
  activeId: string
  onNavigate?: () => void
}) {
  return (
    <ol className="flex flex-col">
      {parts.map((part) => {
        const isActive = part.id === activeId
        return (
          <li key={part.id}>
            <a
              href={`#${part.id}`}
              onClick={onNavigate}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'grid grid-cols-[1.9rem_1fr] items-baseline gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors',
                'hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground'
              )}
            >
              <span className="text-[0.66rem] tabular-nums opacity-70">
                {String(part.number).padStart(2, '0')}
              </span>
              <span className="leading-snug">{part.title}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

/** Sticky rail. Only shown at xl+, where the max-w-7xl shell has room for it. */
export function GuideTocRail({ parts }: { parts: readonly GuideTocEntry[] }) {
  const activeId = useActivePart(parts)
  const activeIndex = parts.findIndex((part) => part.id === activeId)

  return (
    <aside className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] self-start overflow-y-auto xl:block">
      <p className="mb-2 border-b border-border pb-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Contents
      </p>
      <TocList parts={parts} activeId={activeId} />
      <p className="mt-3 border-t border-border pt-2 text-[0.66rem] uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
        Part {Math.max(activeIndex, 0) + 1} of {parts.length}
      </p>
    </aside>
  )
}

/** Below xl, the same list lives in the existing Sheet behind a sticky bar. */
export function GuideTocMobile({ parts }: { parts: readonly GuideTocEntry[] }) {
  const [open, setOpen] = useState(false)
  const activeId = useActivePart(parts)
  const active = parts.find((part) => part.id === activeId) ?? parts[0]

  return (
    <div className="sticky top-16 z-30 -mx-4 mb-6 border-y border-border/60 bg-background/85 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6 xl:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-xl">
            <List className="size-4" aria-hidden="true" />
            <span className="truncate">
              {active ? `Part ${String(active.number).padStart(2, '0')} · ${active.title}` : 'Contents'}
            </span>
            <span className="ms-auto shrink-0 text-xs text-muted-foreground">Jump to</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-75 overflow-y-auto">
          <SheetHeader className="mb-4 border-b border-border pb-4">
            <SheetTitle>Contents</SheetTitle>
          </SheetHeader>
          <div className="px-2 pb-8">
            <TocList parts={parts} activeId={activeId} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
