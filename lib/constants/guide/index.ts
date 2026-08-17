import type { GuidePart } from './types'
import { PART_00_PRINCIPLES } from './part-00-principles'
import { PART_01_TEXT_PHASE } from './part-01-text-phase'
import { PART_02_CHOOSING } from './part-02-choosing'
import { PART_03_DAY_OF } from './part-03-day-of'
import { PART_04_FIRST_FIVE } from './part-04-first-five'
import { PART_05_CONVERSATION } from './part-05-conversation'
import { PART_06_SIGNALS } from './part-06-signals'
import { PART_07_ENDING } from './part-07-ending'
import { PART_08_AFTER } from './part-08-after'
import { PART_09_SAFETY } from './part-09-safety'
import { PART_10_SPECIAL } from './part-10-special'
import { PART_11_CHEAT_SHEETS } from './part-11-cheat-sheets'

/**
 * The First Date Guide, in reading order.
 *
 * Server-only by convention: this module pulls in ~15,000 words, so it must
 * never be imported from a `'use client'` file. Client components receive what
 * they need as props (see `GUIDE_TOC`), and the checklist storage key lives in
 * its own module at `./storage` for exactly this reason.
 */
export const GUIDE_PARTS = [
  PART_00_PRINCIPLES,
  PART_01_TEXT_PHASE,
  PART_02_CHOOSING,
  PART_03_DAY_OF,
  PART_04_FIRST_FIVE,
  PART_05_CONVERSATION,
  PART_06_SIGNALS,
  PART_07_ENDING,
  PART_08_AFTER,
  PART_09_SAFETY,
  PART_10_SPECIAL,
  PART_11_CHEAT_SHEETS,
] as const satisfies readonly GuidePart[]

export type GuidePartId = (typeof GUIDE_PARTS)[number]['id']

/** Lean projection safe to hand to the client-side table of contents. */
export const GUIDE_TOC = GUIDE_PARTS.map((part) => ({
  id: part.id,
  number: part.number,
  title: part.title,
}))

/** Rough reading time, used in the page header. */
export const GUIDE_READING_MINUTES = 55
