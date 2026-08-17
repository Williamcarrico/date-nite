import type { GuidePart } from './types'

export const PART_01_TEXT_PHASE = {
  id: 'the-text-phase',
  number: 1,
  title: 'Before the Date: The Text Phase',
  summary: 'Asking well, locking logistics, and not burning your material on the wrong medium.',
  icon: 'MessageCircle',
  blocks: [
    { kind: 'heading', level: 3, text: 'The timeline' },
    {
      kind: 'paragraph',
      text: '**Ask her out within 2–5 days of matching, or within 2–5 exchanges.** Whichever comes first.',
    },
    {
      kind: 'paragraph',
      text: 'The reason is mechanical: text chemistry and in-person chemistry are weakly correlated. A two-week text rapport builds a version of you in her head that the real you then has to compete with. And every day that passes, the match cools. Long text phases don’t build anticipation — they build attrition.',
    },

    { kind: 'heading', level: 3, text: 'The ask — three scripts' },

    { kind: 'heading', level: 4, text: 'A · The specific plan (highest success rate)' },
    {
      kind: 'script',
      lines: [
        {
          text: '“This is fun, but I’d rather do it in person. There’s a place on [street] with a great patio — are you free Thursday around 7?”',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: 'Decisive, specific, and it gives her one easy binary decision instead of a planning task. Vagueness (“we should hang out sometime”) transfers the work to her and reads as low interest.',
    },

    { kind: 'heading', level: 4, text: 'B · The two-option' },
    {
      kind: 'script',
      lines: [{ text: '“I’d like to buy you a drink. Thursday or Saturday work better for you?”' }],
    },
    {
      kind: 'paragraph',
      text: 'Presupposes yes, gives agency on the variable that actually matters to her schedule. Slightly softer than A — good when you’re less sure of her interest.',
    },

    { kind: 'heading', level: 4, text: 'C · The direct' },
    {
      kind: 'script',
      lines: [{ text: '“I’m enjoying this. Want to get a drink this week?”' }],
    },
    {
      kind: 'paragraph',
      text: 'Clean, honest, zero game. Needs a follow-up message to pin down details, which is one extra step where things can stall — but some people respond better to plainness than to a plan they didn’t help make.',
    },

    {
      kind: 'callout',
      tone: 'rule',
      title: 'The common structure',
      blocks: [
        {
          kind: 'paragraph',
          text: 'All three share the same three properties: **a clear intent, a concrete time, and a low-cost format.** Anything missing one of those is a weaker ask.',
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'Locking the logistics' },
    {
      kind: 'paragraph',
      text: 'Once she says yes, close it out in one message. Don’t let it drift.',
    },
    {
      kind: 'script',
      lines: [
        {
          text: '“Perfect. [Venue], Thursday at 7 — I’ll grab us a spot at the bar. Here’s the address: [link].”',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: 'Send the address. Don’t make her look it up. If she’s meeting you somewhere she’s never been, a link removes friction and quietly signals that you thought about her experience.',
    },

    { kind: 'heading', level: 3, text: 'The confirmation text' },
    {
      kind: 'paragraph',
      text: 'Send it **the day before, in the afternoon.** Not the morning of, not two hours before.',
    },
    {
      kind: 'script',
      lines: [{ text: '“Still on for tomorrow at 7? Looking forward to it.”' }],
    },
    {
      kind: 'paragraph',
      text: 'Two functions: a real confirmation (people forget, plans shift), and the second sentence does actual work — a small, genuine expression of interest right before the date reduces flake rate. One sentence. Don’t stack three.',
    },
    {
      kind: 'paragraph',
      text: 'If she doesn’t reply by the evening before, send one short message the morning of (“Hey — we still good for tonight?”) and then stop. Don’t send a third.',
    },

    { kind: 'heading', level: 3, text: 'What not to do over text' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Long life stories.** Anything over four lines should be saved for in person. You’re burning your best material on the least effective medium.',
        '**Heavy topics.** Divorce, health, trauma, past relationships. Not because they’re shameful — because text strips tone, and heavy topics without tone read as either bleak or attention-seeking.',
        '**Over-texting.** If she takes six hours, don’t double-text. Roughly match her cadence. Two messages for every one of hers means you’re pushing.',
        '**Sexual escalation before meeting.** Very low upside, high downside. If she initiates it, that’s information — but leading with it converts a lot of maybes into nos.',
        '**“Good morning beautiful” energy.** Daily check-ins with someone you haven’t met create obligation without connection.',
        '**Phone calls** — with one exception. A 10-minute call the day before is *excellent* if either of you suggests it: high-bandwidth, kills half the first-five-minutes awkwardness, filters catfish. Don’t push it if she hesitates; some people hate the phone and it isn’t a signal.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Flake-proofing' },
    {
      kind: 'paragraph',
      text: 'Flakes come from three sources: low investment, long lead time, and vagueness. You control all three.',
    },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Lead time: 2–6 days out.** Under two days can read as an afterthought. Over a week and life reshuffles.',
        '**Specificity.** A named venue at a named time flakes far less than “let’s do something this weekend.”',
        '**One warm confirmation** the day before.',
        '**Don’t over-invest beforehand.** Two weeks of daily texting makes a flake expensive. Four days makes it free — and the low-investment approach makes you behave better throughout.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Reading a reschedule' },
    { kind: 'paragraph', text: '**The test is whether she proposes a new time.**' },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'Interest',
          text: '“Ugh, something came up Thursday — can we do Saturday instead?”',
        },
      ],
      note: 'Say yes and move on. Don’t make her explain.',
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'Not interest — or at best ambivalence',
          text: '“Sorry, can’t make Thursday.”',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: 'Respond once, lightly, and let her carry it: *“No worries. Let me know when your week clears up.”* Then don’t chase. A second reschedule without a proposed alternative is a no; treat it as one and move on without a confrontation.',
    },

    { kind: 'heading', level: 3, text: 'Pre-date research: reasonable vs. not' },
    {
      kind: 'paragraph',
      text: '**Reasonable:** re-read her profile the day before. Note two or three specifics — the trip photo, the band, the thing she said she’s obsessed with. That’s preparation, and it lets you ask better questions.',
    },
    {
      kind: 'paragraph',
      text: '**Not:** searching her name, finding her LinkedIn or Instagram, reading her posting history, looking up her employer or address.',
    },
    {
      kind: 'paragraph',
      text: 'Two reasons to skip the deep dive. First, it invades a stranger’s privacy she didn’t consent to. Second — the part people miss — **it actively damages the date.** You’ll either accidentally reveal that you know something you shouldn’t (“wait, how do you know I went to Colorado?”), which is a hard recovery, or you’ll spend the night suppressing what you know, which makes you stiff. Discovering things in real time is most of what makes a first date fun. Don’t spoil your own movie.',
    },
    {
      kind: 'paragraph',
      text: 'Basic safety verification is different and fine: confirming she’s a real person with a consistent presence. That’s a two-minute check, not an investigation.',
    },

    { kind: 'heading', level: 3, text: 'Three things worth knowing beforehand' },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Dietary restrictions** — “Any food you don’t do?” Prevents the vegan-at-a-steakhouse problem.',
        '**Drinker or not** — don’t ask directly; propose an option. “Drinks or coffee — dealer’s choice?” Her answer tells you without making it a thing. Never make a non-drinker justify it.',
        '**Hard time constraints** — “Do you have to be up early Friday?” Lets you plan the shape of the evening and gives her a graceful built-in exit, which paradoxically makes her more relaxed.',
      ],
    },
  ],
} as const satisfies GuidePart
