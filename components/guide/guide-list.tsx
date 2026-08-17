import type { GuideListItem } from '@/lib/constants/guide/types'
import { RichText } from './rich-text'

export function GuideList({
  ordered,
  items,
}: {
  ordered: boolean
  items: readonly GuideListItem[]
}) {
  const className =
    'guide-prose my-4 space-y-2 ps-5 ' +
    (ordered ? 'list-decimal marker:text-primary marker:font-semibold' : 'list-disc marker:text-primary/60')

  const children = items.map((item, i) =>
    typeof item === 'string' ? (
      <li key={i}>
        <RichText text={item} />
      </li>
    ) : (
      <li key={i}>
        <RichText text={item.text} />
        <ul className="mt-2 space-y-1.5 ps-5 list-disc marker:text-primary/40">
          {item.children.map((child, j) => (
            <li key={j}>
              <RichText text={child} />
            </li>
          ))}
        </ul>
      </li>
    )
  )

  return ordered ? <ol className={className}>{children}</ol> : <ul className={className}>{children}</ul>
}
