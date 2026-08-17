import type { GuidePart } from './types'

export const PART_07_ENDING = {
  id: 'ending-the-date',
  number: 7,
  title: 'Ending the Date Well',
  summary: 'Leave while it’s still good, handle the bill cleanly, and ask for date two in person.',
  icon: 'Heart',
  blocks: [
    { kind: 'heading', level: 3, text: 'End early, on a high' },
    {
      kind: 'paragraph',
      text: '**The most counterintuitive and highest-return move in the entire guide: leave while it’s still good.**',
    },
    {
      kind: 'paragraph',
      text: 'The instinct is to stretch a good date as long as possible. But the last twenty minutes is what she’ll remember most vividly, and a date that runs long almost always ends in a lower-energy place than its peak — tired, a little drunk, conversation thinning out. A 90-minute date ending at peak energy generates far more desire for a second date than a four-hour one ending in fatigue.',
    },
    {
      kind: 'script',
      lines: [{ text: '“I’ve got to get going — but this was great. I want to do it again.”' }],
    },
    {
      kind: 'paragraph',
      text: 'You leave her with an unfinished feeling. Unfinished is exactly what you want. People rate an experience heavily on its peak and its ending, not its length.',
    },
    {
      kind: 'paragraph',
      text: '**The exception:** occasionally you’re two hours in and it is obviously extraordinary. Stay. But know you’re taking the exception, not defaulting into it because neither of you knew how to leave.',
    },

    { kind: 'heading', level: 3, text: 'The 90-minute check' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Energy high, she’s asking questions, no exit signals** → take the Act 2 option. Then end 45–60 minutes after that.',
        '**Energy fine but settled** → close it out warm and leave on the high note.',
        '**Energy low** → end it now, kindly.',
      ],
    },

    { kind: 'heading', level: 3, text: 'The bill' },
    { kind: 'paragraph', text: '**Default: whoever asked, pays.** Reach for it without ceremony.' },
    { kind: 'paragraph', text: 'If she offers to split, two acceptable moves:' },
    {
      kind: 'list',
      ordered: true,
      items: [
        '“I’ve got it — you can get the next one.” Warm, and it plants a second date.',
        'If she insists a second time: “Deal, let’s split it.” Then let it go.',
      ],
    },
    {
      kind: 'paragraph',
      text: '**Never argue about the bill for more than one exchange.** The argument is worse than either outcome. Insisting past her second offer overrides her stated preference, which is a small preview of not listening. Letting her pay when she genuinely wants to isn’t a failure of chivalry — it’s respecting what she said.',
    },
    {
      kind: 'paragraph',
      text: 'Never comment on the total, never imply she owes you anything, tip properly.',
    },

    { kind: 'heading', level: 3, text: 'The goodbye' },
    {
      kind: 'paragraph',
      text: 'Walk her out. Walk her to her car if it’s in the same direction — **but ask, don’t assume:** “Are you parked close? I’ll walk you.” If she says she’s fine, accept it immediately and cheerfully.',
    },
    {
      kind: 'paragraph',
      text: '**Reading it — three options:** a hug (the default, right roughly always), a cheek kiss (if there’s been touch and warmth all night), or a kiss.',
    },
    {
      kind: 'paragraph',
      text: 'How to tell in the moment: **stop walking, turn toward her, hold eye contact for a beat without saying anything.** That pause is the whole test. If she holds the eye contact, steps in, or her eyes drop to your mouth — that’s a yes. If she starts talking, steps back, or angles into a side-hug — take the hug and be delighted about it.',
    },

    { kind: 'heading', level: 3, text: 'The kiss' },
    {
      kind: 'paragraph',
      text: '**Timing:** at the goodbye, outdoors, at the end. Not in the middle of the bar, not on the walk over.',
    },
    {
      kind: 'paragraph',
      text: '**Mechanics:** stop, turn, close some distance, eye contact, *pause.* The pause is what makes it consensual and what makes it good — you’re creating a moment where she can lean in or step back, and either answer is easy to give. Then move slowly. Slow is confident. Fast is a grab.',
    },
    { kind: 'paragraph', text: '**When unsure, say it.**' },
    { kind: 'script', lines: [{ text: '“I want to kiss you.”' }] },
    {
      kind: 'paragraph',
      text: 'Then pause. That sentence isn’t unromantic — it’s one of the more attractive things you can say, because it’s clear, unhurried, and puts her in control of the next second.',
    },
    {
      kind: 'callout',
      tone: 'rule',
      title: 'If she says no or turns her cheek',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Smile, hug her, “Good night, I had a great time,” and go. No comment, no visible disappointment, no “was it something I did?” Handling a no perfectly is genuinely attractive, and a meaningful number of second dates come from exactly this moment.',
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'The second-date ask — do it in person' },
    {
      kind: 'paragraph',
      text: 'Most people go home and text it. **Ask before you leave.** In-person asks succeed at a much higher rate — she’s still in the mood the date created, and a text ask has to survive the trip through her overthinking.',
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'The specific plan — stronger, if you have a hook',
          text: '“There’s a place downtown that does the ramen you were describing. I want to take you Thursday.”',
        },
      ],
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'The open ask — better with no hook yet',
          text: '“I want to see you again. What does your week look like?”',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: 'Both are direct, confident, and assume a yes without demanding one. Neither is a question about whether she’s interested — it’s a question about logistics. That’s the correct frame.',
    },
    {
      kind: 'paragraph',
      text: 'If she’s vague (“yeah, let’s do something”), take it gracefully and text a specific plan tomorrow. Don’t push for a day at the curb.',
    },

    { kind: 'heading', level: 3, text: 'Ending a date that isn’t working' },
    {
      kind: 'paragraph',
      text: 'Be kind, be clean, don’t fake enthusiasm you don’t have. Around the 45–60 minute mark:',
    },
    {
      kind: 'script',
      lines: [{ text: '“I’m going to head out — I’ve got an early one. Thanks for meeting me, this was fun.”' }],
    },
    {
      kind: 'paragraph',
      text: '**Don’t say “we should do this again” if you don’t mean it.** A false promise feels kinder in the moment and is meaner over the next four days while she waits for a text that isn’t coming.',
    },
    {
      kind: 'paragraph',
      text: 'If she asks directly whether you want to see her again, tell her the truth, briefly and gently:',
    },
    {
      kind: 'script',
      lines: [
        {
          text: '“Honestly, I had a good time, but I don’t think we’re the right fit. I’m glad we met, though.”',
        },
      ],
      note: 'Awkward for ten seconds, clean forever.',
    },

    { kind: 'heading', level: 3, text: 'After you leave' },
    { kind: 'script', lines: [{ text: '“Made it home — hope you did too.”' }] },
    { kind: 'paragraph', text: 'Short. That’s the whole message. The real follow-up comes next.' },
  ],
} as const satisfies GuidePart
