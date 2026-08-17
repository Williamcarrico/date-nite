import { Fragment, type ReactNode } from 'react'

/**
 * Splits on markdown-lite inline emphasis. `**bold**` must come first in the
 * alternation so it wins over `*italic*`.
 *
 * The `/g` flag is safe here: `String.prototype.split` ignores `lastIndex`, so
 * this module-level regex carries no state between calls.
 */
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g

/**
 * Renders the guide's markdown-lite emphasis. Input is authored content from
 * `lib/constants/guide/*`, never user input — there is no HTML parsing and no
 * `dangerouslySetInnerHTML`. Unbalanced markers fall through as literal text.
 */
export function parseInline(text: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        )
      }
      return <Fragment key={i}>{part}</Fragment>
    })
}

export function RichText({ text }: { text: string }) {
  return <>{parseInline(text)}</>
}
