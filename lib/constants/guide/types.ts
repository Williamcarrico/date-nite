/**
 * Content model for the First Date Guide (`/app/guide`).
 *
 * The guide is ~15,000 words of authored prose stored as typed `as const` data
 * rather than JSX, so the modules stay server/client-safe and the part ids stay
 * literal types. Inline emphasis is markdown-lite (`**bold**`, `*italic*`,
 * `` `code` ``) and is rendered by `<RichText>` at build time.
 *
 * Every array field is `readonly` — `as const` produces readonly arrays, and a
 * mutable field here would fail every `satisfies GuidePart` in this folder.
 */

/** A string containing markdown-lite inline emphasis. Rendered by `<RichText>`. */
export type RichText = string

/* ------------------------------------------------------------------ */
/* Leaf blocks — these are also the only blocks legal inside a callout */
/* ------------------------------------------------------------------ */

/** A bullet. Only one entry in the whole guide needs the nested form. */
export type GuideListItem =
  | RichText
  | { readonly text: RichText; readonly children: readonly RichText[] }

/**
 * One line of a verbatim script. `speaker` is the small uppercase label above
 * the line — "You", "Her", "Interest", "What" / "How" / "Why" / "Feeling".
 */
export type GuideScriptLine = {
  readonly speaker?: string
  readonly text: RichText
}

export type GuideLeafBlock =
  | { readonly kind: 'paragraph'; readonly text: RichText }
  | {
      readonly kind: 'list'
      readonly ordered: boolean
      readonly items: readonly GuideListItem[]
    }
  | {
      readonly kind: 'script'
      readonly label?: string
      readonly lines: readonly GuideScriptLine[]
      readonly note?: RichText
    }
  | {
      readonly kind: 'doDont'
      readonly label?: string
      readonly good: RichText
      readonly bad: RichText
    }

/* ------------------------------------------------------------------ */
/* Tables                                                             */
/* ------------------------------------------------------------------ */

export type GuideTableVariant =
  /** Wide (up to 6 columns). Scrolls on desktop, stacks into cards on mobile. */
  | 'matrix'
  /** Two columns — never-ask, repairs, signal card. */
  | 'pair'
  /** 2x2 grid where the first header cell is intentionally empty. */
  | 'quadrant'

export type GuideTable = {
  readonly kind: 'table'
  readonly variant: GuideTableVariant
  readonly caption?: string
  readonly columns: readonly { readonly key: string; readonly label: RichText }[]
  /** Positional cells — each row must have `columns.length` entries. */
  readonly rows: readonly (readonly RichText[])[]
  /** Render each row's first cell as `<th scope="row">` (quadrant, signal card). */
  readonly rowHeader?: boolean
}

/* ------------------------------------------------------------------ */
/* Callouts                                                           */
/* ------------------------------------------------------------------ */

export type GuideCalloutTone = 'rule' | 'insight' | 'warning' | 'safety'

export type GuideCallout = {
  readonly kind: 'callout'
  readonly tone: GuideCalloutTone
  readonly title?: string
  /**
   * Deliberately `GuideLeafBlock[]` and not `GuideBlock[]`: one level of nesting
   * is all the content needs, and a recursive union turns a single mis-typed
   * block into an unreadable error.
   */
  readonly blocks: readonly GuideLeafBlock[]
}

/* ------------------------------------------------------------------ */
/* Question bank                                                      */
/* ------------------------------------------------------------------ */

export type GuideQuestion = {
  readonly n: number
  readonly q: string
  /** Italic annotation, e.g. "Handle gently — can land heavy." */
  readonly note?: RichText
}

export type GuideQuestionGroup = {
  readonly id: string
  readonly title: string
  /** Short right-aligned label in the summary row, e.g. "20 · tier 2". */
  readonly tierHint?: string
  /** Paragraph shown when the group is expanded. */
  readonly blurb?: RichText
  readonly questions: readonly GuideQuestion[]
}

/* ------------------------------------------------------------------ */
/* Checklist                                                          */
/* ------------------------------------------------------------------ */

export type GuideChecklistItem = {
  /** Stable id — persisted to localStorage, so never renumber these. */
  readonly id: string
  readonly text: RichText
}

export type GuideChecklistGroup = {
  readonly id: string
  readonly title: string
  readonly items: readonly GuideChecklistItem[]
}

/* ------------------------------------------------------------------ */
/* The block union                                                    */
/* ------------------------------------------------------------------ */

export type GuideBlock =
  | GuideLeafBlock
  | GuideTable
  | GuideCallout
  | {
      readonly kind: 'heading'
      readonly level: 3 | 4
      readonly text: string
      /** Defaults to a slug of `text`. */
      readonly id?: string
    }
  | {
      readonly kind: 'questionBank'
      readonly intro?: RichText
      readonly groups: readonly GuideQuestionGroup[]
    }
  | { readonly kind: 'checklist'; readonly groups: readonly GuideChecklistGroup[] }
  | {
      readonly kind: 'keyPoints'
      readonly title: string
      readonly items: readonly RichText[]
    }

/* ------------------------------------------------------------------ */
/* Parts                                                              */
/* ------------------------------------------------------------------ */

export type GuidePart = {
  readonly id: string
  readonly number: number
  readonly title: string
  /** One line, shown under the part heading and in the mobile TOC. */
  readonly summary: string
  /** A lucide icon NAME, resolved by `components/guide/guide-icon-map.tsx`. */
  readonly icon: string
  readonly blocks: readonly GuideBlock[]
}
