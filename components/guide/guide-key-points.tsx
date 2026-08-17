import { RichText } from './rich-text'

/** The closing "if you remember nothing else" list — the page's payoff block. */
export function GuideKeyPoints({
  title,
  items,
}: {
  title: string
  items: readonly string[]
}) {
  return (
    <div className="my-8 rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:p-7">
      <h3 className="font-display text-xl sm:text-2xl font-bold text-gradient-primary mb-5">
        {title}
      </h3>
      <ol className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span
              className="gradient-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums text-white"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="leading-relaxed">
              <RichText text={item} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
