import type { GuidePart } from './types'

export const PART_04_FIRST_FIVE = {
  id: 'first-five-minutes',
  number: 4,
  title: 'The First Five Minutes',
  summary: 'Not what you say — the energy you set. Warm, relaxed, glad to be there.',
  icon: 'Handshake',
  blocks: [
    {
      kind: 'paragraph',
      text: 'These minutes set the frame for the whole date — not because of anything you say, but because of the energy you establish.',
    },

    { kind: 'heading', level: 3, text: 'The greeting' },
    { kind: 'paragraph', text: '**Stand, smile, eye contact, name.**' },
    {
      kind: 'script',
      lines: [{ text: '“Hey — Sarah? I’m [your name]. Good to finally meet you.”' }],
    },
    {
      kind: 'paragraph',
      text: '**The hug/handshake question.** For a date, a brief hug is the right default in most of the US — a handshake reads as a job interview and sets a platonic frame you’ll spend twenty minutes climbing out of.',
    },
    {
      kind: 'paragraph',
      text: 'How to read it in real time: step slightly toward her with your arms in a neutral, open position and let her body answer. She’ll lean in (hug), extend a hand (handshake), or turn slightly to the side (side-hug). All three are fine. The mistake is committing hard to a full hug before you’ve read her — take a half-step, offer, follow her lead. It takes half a second and never looks awkward as long as you’re not tense about it.',
    },
    {
      kind: 'paragraph',
      text: 'If she gives you a handshake, take it without a flicker of disappointment. Some people just aren’t huggers, and it is not a verdict on you.',
    },

    { kind: 'heading', level: 3, text: 'The first three sentences' },
    {
      kind: 'script',
      lines: [
        { text: '“You found it okay? Parking around here is a war crime.”' },
        { text: '“You look great. That jacket is excellent.”' },
        { text: '“I grabbed us the corner — I figured we’d actually be able to hear each other.”' },
      ],
    },
    {
      kind: 'paragraph',
      text: 'All three are easy, require no cleverness, and signal that you thought about her experience. Nobody has ever ruined a date with unremarkable opening small talk. People ruin dates by trying to open with something clever.',
    },

    { kind: 'heading', level: 3, text: 'The compliment' },
    { kind: 'paragraph', text: '**One, early, specific, and about something she chose.**' },
    {
      kind: 'doDont',
      good: '“That jacket is great.” / “Your taste in bars is significantly better than mine.” / “You have a really good laugh.”',
      bad: '“You’re gorgeous.” / “You have amazing eyes.” / anything about her body.',
    },
    {
      kind: 'paragraph',
      text: 'Why chosen over genetic: a compliment on something she selected — outfit, taste, energy, humor, a decision she made — credits her judgment. A compliment on her face or body credits her genetics, which she had nothing to do with, and moves the frame toward the physical before you’ve earned it. Genetic compliments also arrive constantly and get discounted; a specific one about her boots does not.',
    },
    {
      kind: 'paragraph',
      text: '**One compliment in the first five minutes, then stop for a while.** Repeated compliments early read as nervous or transactional. Give another later, earned by something she actually said or did — that one lands ten times harder.',
    },

    { kind: 'heading', level: 3, text: 'Ordering' },
    {
      kind: 'paragraph',
      text: 'Order first if she hesitates — it releases her from deciding what tier of expense is appropriate. Order what you actually want. **Don’t comment on what she orders, ever, in any direction** — not “wow, big drink,” not “just a salad?” If she orders something non-alcoholic, order what you were going to order and say nothing about it. If she’s a non-drinker, do not ask why. If she wants to tell you, she will.',
    },

    { kind: 'heading', level: 3, text: 'Pace' },
    {
      kind: 'paragraph',
      text: 'The first five minutes are *supposed* to be small talk. Weather, parking, the venue, how the day went. This isn’t failure — it’s a warm-up whose job is to sync both nervous systems before anything real happens. Jumping to “so what’s your greatest fear?” at minute two is jarring and reads as a technique.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Shape of a good first date',
      blocks: [
        {
          kind: 'list',
          ordered: false,
          items: [
            '**Minutes 0–10** — logistics, small talk, easy facts. Low stakes, building comfort.',
            '**Minutes 10–35** — opinions, stories, laughing. Energy comes up.',
            '**Minutes 35–90** — real things. Values, history, what she cares about. Where the connection forms.',
          ],
        },
        { kind: 'paragraph', text: 'Don’t rush it. Let it climb.' },
      ],
    },
  ],
} as const satisfies GuidePart
