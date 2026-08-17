import type { GuideTable as GuideTableBlock } from '@/lib/constants/guide/types'
import { RichText } from './rich-text'

/**
 * Semantic table, hand-rolled rather than using a shadcn primitive: the shipped
 * `ui/table.tsx` is marked `'use client'`, which would push every cell of the
 * guide's tables across the RSC boundary for no interactivity.
 *
 * `matrix` tables are genuinely unreadable at phone widths, so they render twice
 * from one data source — a real `<table>` at `md:` and up, and a stacked
 * definition view below. Both are server-rendered; neither costs any JS.
 */
export function GuideTable({
  variant,
  caption,
  columns,
  rows,
  rowHeader,
}: {
  variant: GuideTableBlock['variant']
  caption?: string
  columns: GuideTableBlock['columns']
  rows: GuideTableBlock['rows']
  rowHeader?: boolean
}) {
  const table = (
    // Negative margin lets the scroll area bleed to the viewport edge inside the
    // app shell's px-4/px-6 padding, so the scroll affordance isn't clipped.
    <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
      <table className="guide-table w-full min-w-[34rem] border-collapse text-left text-sm">
        {caption ? (
          <caption className="mb-3 text-start text-sm text-muted-foreground">{caption}</caption>
        ) : null}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="border-b border-border pb-2 pe-4 align-bottom text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                <RichText text={col.label} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {row.map((cell, j) =>
                rowHeader && j === 0 ? (
                  <th
                    key={j}
                    scope="row"
                    className="py-2.5 pe-4 align-top text-sm font-semibold text-foreground"
                  >
                    <RichText text={cell} />
                  </th>
                ) : (
                  <td key={j} className="py-2.5 pe-4 align-top leading-relaxed">
                    <RichText text={cell} />
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (variant !== 'matrix') {
    return <div className="my-6">{table}</div>
  }

  return (
    <div className="my-6">
      <div className="hidden md:block">{table}</div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-semibold text-foreground">
              <RichText text={row[0] ?? ''} />
            </p>
            <dl className="mt-2 space-y-1">
              {columns.slice(1).map((col, j) => (
                <div key={col.key} className="flex gap-2 text-sm">
                  <dt className="min-w-24 shrink-0 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    <RichText text={col.label} />
                  </dt>
                  <dd className="leading-relaxed">
                    <RichText text={row[j + 1] ?? ''} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
