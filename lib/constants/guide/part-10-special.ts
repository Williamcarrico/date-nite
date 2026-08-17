import type { GuidePart } from './types'

export const PART_10_SPECIAL = {
  id: 'special-situations',
  number: 10,
  title: 'Special Situations',
  summary: 'Kids and a complicated backstory, long gaps, age differences, high-anxiety days.',
  icon: 'Clock3',
  blocks: [
    { kind: 'heading', level: 3, text: 'Dating with a complicated backstory' },
    { kind: 'paragraph', text: '**The rule: honest but not detailed.**' },
    {
      kind: 'paragraph',
      text: 'Never lie or dodge — it’s disqualifying when it comes out later, and it will. But a first date isn’t the venue for a full accounting, and volunteering the whole file does two things you don’t want: it makes the evening about your hardest subject, and it puts her in the role of therapist before she’s decided whether she likes you.',
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: '“Do you have kids?”',
          text: '“Yeah, [one / two] — [ages]. Best thing in my life, and genuinely funnier than I am.”',
        },
      ],
      note: 'Warm, brief, unapologetic, and it hands her a thread. If she asks more, answer more. Don’t lead with custody logistics or the schedule.',
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: '“Are you divorced?” / “What’s your situation?”',
          text: '“Divorced — [finalized last year / still finishing up]. It was a long road and it’s mostly behind me now. Happy to get into it sometime, but it’s not really tonight’s story.”',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: 'That last clause is the key sentence in this whole section. It’s honest, it’s not evasive, and it sets a boundary in a way that’s confident rather than defensive. Most people will respect it immediately and move on. Some will ask a direct follow-up — answer it plainly, in a sentence or two, then redirect:',
    },
    {
      kind: 'script',
      lines: [
        {
          text: '“Yeah, it was a hard one. Anyway — you were telling me about the Denver thing.”',
        },
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'What to hold back',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Court dates, filings, what your ex did, custody arrangements in detail, financial fallout, anything you’re actively angry about. Not because it’s shameful — because **anger about a third party is the single most damaging thing you can put on a first date table.** Even completely justified anger reads as unresolved, and unresolved reads as unavailable.',
        },
        {
          kind: 'paragraph',
          text: '**The honest self-check:** can you talk about it for two minutes without your jaw tightening? If not, that’s worth knowing about your own readiness — not a reason not to date, but a reason to keep it off the table for now.',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: '**When to give more:** date two or three, when she’s asked and there’s enough context that the detail is information rather than a dump.',
    },

    { kind: 'heading', level: 3, text: 'First date after a long relationship' },
    {
      kind: 'paragraph',
      text: 'You are rusty and it will show for about twenty minutes. Fine — and fixable by naming it once, lightly: “Full disclosure, I haven’t done this in a while.” Charming exactly once.',
    },
    {
      kind: 'paragraph',
      text: 'Two things to watch: **comparing her to your ex** (out loud or in your head — either one colors the evening), and **moving too fast** because attention feels good after a drought. The intensity you feel on date one after a long dry spell is mostly about you, not about her. Give it three dates before you trust it.',
    },

    { kind: 'heading', level: 3, text: 'First date after a long dry spell' },
    {
      kind: 'paragraph',
      text: 'The main risk is over-weighting. One date in six months carries an unreasonable load, and you’ll feel it — too eager, too agreeable, too invested in the outcome. The fix is structural: get more dates in motion. Two or three prospects makes you dramatically better on every one of them, not because you’re playing anyone, but because the pressure comes off.',
    },

    { kind: 'heading', level: 3, text: 'Age gaps' },
    {
      kind: 'paragraph',
      text: 'Fine, common, and not worth a discussion on the date. Don’t be condescending in either direction, don’t make the gap a running bit, and do pay attention to whether life stages line up — someone finishing school and someone with a mortgage and a kid are on different clocks. That’s a compatibility question, not a moral one.',
    },

    { kind: 'heading', level: 3, text: 'App date vs. set-up vs. someone you already know' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**App date:** zero shared context. Assume nothing, over-invest slightly in the greeting and first ten minutes, expect a warm-up period.',
        '**Set-up by friends:** social accountability in both directions raises the floor and lowers the ceiling. Don’t spend the date talking about the mutual friend.',
        '**Someone you already know:** the frame shift is the whole challenge. Do something explicitly date-like at a date-like venue so it isn’t ambiguous, and address the shift once, early: *“So this is a date, just so we’re clear.”* Directness resolves the weirdness instantly; ambiguity lets it fester all night.',
      ],
    },

    { kind: 'heading', level: 3, text: 'High-anxiety days and lower-load formats' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Side-by-side beats face-to-face.** A walk, a market, bar seats. Sustained eye contact is a large part of the load.',
        '**Activity-based beats conversation-only.** Mini golf gives you something to do with your hands and generates topics for you.',
        '**Daytime beats evening.** Lower stakes, shorter, no alcohol variable.',
        '**Shorter beats longer.** A firm 60-minute coffee with a real reason to leave.',
        '**Name it once if it helps.** “I get a little in my head at the start of these — give me ten minutes and I’ll be normal.” Disarming and honest, and most people relate hard. Once, not four times.',
      ],
    },

    { kind: 'heading', level: 3, text: 'When you’re not interested by minute 10' },
    {
      kind: 'paragraph',
      text: 'Stay the planned duration — roughly an hour — and be genuinely good company. Two reasons: your read at minute 10 is frequently wrong (a nervous person at minute 10 is a completely different person at minute 40), and even when it’s right, an hour of being decent to someone costs you very little and is simply how you want to treat people. Then end it cleanly and don’t promise anything.',
    },
    {
      kind: 'paragraph',
      text: 'The exception is a genuine red flag — cruelty, boundary pushing, safety concerns. Then leave, and don’t feel obligated to be gracious about it.',
    },

    { kind: 'heading', level: 3, text: 'When she’s not interested by minute 10' },
    {
      kind: 'paragraph',
      text: 'Don’t chase and don’t get performative — increasing effort in the face of low engagement makes it worse, every time. Run the nervous-vs-uninterested check. If it’s nerves, lower the pressure. If it’s genuinely not there, relax into it, be pleasant, wrap up at a natural point, and go home without a story about what you did wrong. Some people don’t click. That’s the mechanism working correctly.',
    },
  ],
} as const satisfies GuidePart
