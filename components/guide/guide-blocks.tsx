import type { GuideBlock } from '@/lib/constants/guide/types'
import { GuideCallout } from './guide-callout'
import { GuideChecklist } from './guide-checklist'
import { GuideHeading } from './guide-heading'
import { GuideKeyPoints } from './guide-key-points'
import { GuideLeafBlockNode } from './guide-leaf-blocks'
import { GuideTable } from './guide-table'
import { QuestionBank } from './question-bank'

function GuideBlockNode({ block }: { block: GuideBlock }) {
  switch (block.kind) {
    case 'paragraph':
    case 'list':
    case 'script':
    case 'doDont':
      return <GuideLeafBlockNode block={block} />
    case 'heading':
      return <GuideHeading level={block.level} text={block.text} id={block.id} />
    case 'callout':
      return <GuideCallout tone={block.tone} title={block.title} blocks={block.blocks} />
    case 'table':
      return (
        <GuideTable
          variant={block.variant}
          caption={block.caption}
          columns={block.columns}
          rows={block.rows}
          rowHeader={block.rowHeader}
        />
      )
    case 'keyPoints':
      return <GuideKeyPoints title={block.title} items={block.items} />
    case 'questionBank':
      return <QuestionBank intro={block.intro} groups={block.groups} />
    case 'checklist':
      return <GuideChecklist groups={block.groups} />
    default:
      block satisfies never
      return null
  }
}

export function GuideBlocks({ blocks }: { blocks: readonly GuideBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <GuideBlockNode key={i} block={block} />
      ))}
    </>
  )
}
