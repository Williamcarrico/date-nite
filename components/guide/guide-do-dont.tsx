import { Check, X } from 'lucide-react'
import { RichText } from './rich-text'

/**
 * A ✓/✕ pair. The marks are lucide icons rather than emoji so they inherit
 * `currentColor`, scale with the type, and render identically in dark mode.
 */
export function GuideDoDont({
  label,
  good,
  bad,
}: {
  label?: string
  good: string
  bad: string
}) {
  return (
    <div className="my-5 space-y-2">
      {label ? (
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      ) : null}

      <div className="flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
        <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        <p className="text-[0.98rem] leading-relaxed">
          <span className="sr-only">Don&rsquo;t: </span>
          <RichText text={bad} />
        </p>
      </div>

      <div className="flex gap-3 rounded-xl border border-success/25 bg-success/5 p-3">
        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
        <p className="text-[0.98rem] leading-relaxed">
          <span className="sr-only">Do: </span>
          <RichText text={good} />
        </p>
      </div>
    </div>
  )
}
