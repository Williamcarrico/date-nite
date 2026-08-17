import { ChevronDown } from 'lucide-react'
import type { GuideQuestionGroup } from '@/lib/constants/guide/types'
import { RichText } from './rich-text'

/**
 * Native `<details>` rather than the Radix accordion. Radix would make this a
 * client component, which would serialize all 110 questions into the RSC payload
 * on top of the HTML. Native gives correct keyboard and screen-reader semantics
 * for free, works before hydration, and lets the browser's find-in-page expand
 * collapsed groups.
 */
export function QuestionBank({
  intro,
  groups,
}: {
  intro?: string
  groups: readonly GuideQuestionGroup[]
}) {
  return (
    <div className="my-6">
      {intro ? (
        <p className="guide-prose mb-4">
          <RichText text={intro} />
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {groups.map((group) => (
          <details key={group.id} className="group border-b border-border last:border-0">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 font-semibold transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              <span>{group.title}</span>
              {group.tierHint ? (
                <span className="text-[0.66rem] font-normal uppercase tracking-[0.1em] text-muted-foreground">
                  {group.tierHint}
                </span>
              ) : null}
              <ChevronDown
                className="ms-auto size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>

            <div className="px-4 pb-5">
              {group.blurb ? (
                <p className="mb-3 text-sm italic text-muted-foreground">
                  <RichText text={group.blurb} />
                </p>
              ) : null}
              <ol className="space-y-2.5">
                {group.questions.map((question) => (
                  <li key={question.n} className="flex gap-3">
                    <span className="mt-0.5 w-7 shrink-0 text-right text-[0.7rem] font-semibold tabular-nums text-primary/70">
                      {question.n}
                    </span>
                    <span className="leading-relaxed">
                      {question.q}
                      {question.note ? (
                        <span className="ms-1.5 text-sm italic text-muted-foreground">
                          <RichText text={question.note} />
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
