import type { GuidePart } from './types'

export const PART_09_SAFETY = {
  id: 'safety-and-logistics',
  number: 9,
  title: 'Safety & Logistics',
  summary: 'Both directions. This section is not optional.',
  icon: 'ShieldCheck',
  blocks: [
    { kind: 'heading', level: 3, text: 'Your own baseline' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Meet in public**, both ways, for the first two dates at minimum.',
        '**Drive yourself.** Both directions.',
        '**Tell someone** where you’re going, with whom, and when you expect to be back. Share your location with a friend for the evening.',
        '**Watch your drink.** Don’t leave it unattended; if you do, order a new one. Spiking isn’t gendered.',
        '**Cap at two drinks.** You need your judgment for reading signals and for consent, and both directions depend on it.',
        '**Never give out your home address** before you’ve met a few times, and never let a first date come to your place or go to theirs.',
        '**Trust discomfort.** If something feels wrong, you don’t need it to be justifiable. Leave.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Making her feel safe' },
    {
      kind: 'paragraph',
      text: 'She’s arriving with more risk than you are and she knows it. Nearly everything here is free, and doing it well is genuinely attractive because it demonstrates that you think about other people’s experience.',
    },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Meet there.** Don’t offer to pick her up on a first date, even to be nice. It requires her to give you her address and surrender her exit.',
        '**Let her pick or veto the venue.** “Here’s my suggestion, but I’m easy — anywhere you like works.”',
        '**Don’t push a venue change**, especially not to anywhere private, especially not late.',
        '**Don’t push drinks.** If she’s slowing down, slow down with her. Never order for her without asking. Never top her up “as a surprise.”',
        '**Don’t block her physically.** Not between her and the exit, not cornered at a table.',
        '**Ask before you walk her out** — and accept a no instantly.',
        '**Don’t press for where she lives.** “This side of town” is all you need.',
        '**Respect a no the first time.** On anything. The first no is the only one you should ever need.',
        '**Say the quiet part when it helps.** “No pressure at all — genuinely fine either way” costs nothing and does a lot of work.',
      ],
    },

    { kind: 'heading', level: 3, text: 'App-specific scam awareness' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Venue steering** — insisting on a specific bar or club you’ve never heard of, often with a “friend” who works there. A known scam where inflated bills get run on your card.',
        '**The crypto/investment pivot** — any conversation that finds its way to an investment opportunity. Universal, and always a scam.',
        '**The emergency ask** — a crisis requiring money, usually right before or right after a first meeting.',
        '**Refusal to video chat or talk on the phone** before meeting, with reasons that keep shifting.',
        '**Immediate off-app migration** plus intense, fast affection.',
        '**Anyone asking for money, gift cards, or account access.** Ever. There is no exception.',
      ],
    },

    { kind: 'heading', level: 3, text: 'If you feel unsafe or need out' },
    {
      kind: 'callout',
      tone: 'safety',
      title: 'Three clean exits',
      blocks: [
        {
          kind: 'list',
          ordered: false,
          items: [
            '**The clean exit:** “I’m going to head out. Take care.” You don’t owe an explanation, and you’re allowed to leave mid-drink.',
            '**The bartender ask:** go to the bar and tell staff you’re uncomfortable and would like help leaving. Every bar in America knows this request; many have a formal protocol for it.',
            '**The call:** step outside, take a “call,” come back to say something came up.',
          ],
        },
        {
          kind: 'paragraph',
          text: '**Don’t accept a ride** from someone you’ve just met, and don’t offer one in a way that’s hard to decline.',
        },
      ],
    },
  ],
} as const satisfies GuidePart
