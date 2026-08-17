import type { GuideLeafBlock } from '@/lib/constants/guide/types'
import { GuideDoDont } from './guide-do-dont'
import { GuideList } from './guide-list'
import { GuideScript } from './guide-script'
import { RichText } from './rich-text'

/**
 * Renders the subset of blocks that may appear both at part level and inside a
 * callout. Lives in its own module so `guide-blocks` and `guide-callout` can
 * both use it without importing each other.
 */
export function GuideLeafBlockNode({ block }: { block: GuideLeafBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p className="guide-prose my-4">
          <RichText text={block.text} />
        </p>
      )
    case 'list':
      return <GuideList ordered={block.ordered} items={block.items} />
    case 'script':
      return <GuideScript label={block.label} lines={block.lines} note={block.note} />
    case 'doDont':
      return <GuideDoDont label={block.label} good={block.good} bad={block.bad} />
    default:
      // Exhaustiveness without a binding — `const _x: never = block` would fail
      // this project's `noUnusedLocals`.
      block satisfies never
      return null
  }
}

export function GuideLeafBlocks({ blocks }: { blocks: readonly GuideLeafBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <GuideLeafBlockNode key={i} block={block} />
      ))}
    </>
  )
}
