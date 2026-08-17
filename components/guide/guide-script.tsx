import type { GuideScriptLine } from '@/lib/constants/guide/types'
import { RichText } from './rich-text'

/**
 * A verbatim "say this" block — the guide's most-used device. Rendered as a
 * quote with a primary rule so scripts are scannable at a glance.
 */
export function GuideScript({
  label,
  lines,
  note,
}: {
  label?: string
  lines: readonly GuideScriptLine[]
  note?: string
}) {
  return (
    <figure className="my-5">
      {label ? (
        <figcaption className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </figcaption>
      ) : null}

      <div className="guide-script space-y-3 border-s-2 border-primary ps-4">
        {lines.map((line, i) => (
          <div key={i}>
            {line.speaker ? (
              <span className="mb-0.5 block text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {line.speaker}
              </span>
            ) : null}
            <p className="text-[1.02rem] leading-relaxed text-foreground">
              <RichText text={line.text} />
            </p>
          </div>
        ))}
      </div>

      {note ? (
        <p className="mt-2 ps-4 text-sm italic text-muted-foreground">
          <RichText text={note} />
        </p>
      ) : null}
    </figure>
  )
}
