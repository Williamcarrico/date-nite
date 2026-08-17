import type { GuidePart } from './types'

export const PART_08_AFTER = {
  id: 'after-the-date',
  number: 8,
  title: 'After the Date',
  summary: 'The follow-up text, the honest no, the self-debrief, and handling rejection.',
  icon: 'CalendarCheck',
  blocks: [
    { kind: 'heading', level: 3, text: 'The follow-up text' },
    {
      kind: 'paragraph',
      text: '**Send it that night or first thing the next morning.** Not three days later.',
    },
    {
      kind: 'paragraph',
      text: 'The “wait three days” rule is dead and was always bad. It manufactures anxiety in someone who was just enjoying themselves, and its whole point — appearing not too invested — is a game that only works on people you don’t want to be playing games with. Interested people text.',
    },
    {
      kind: 'callout',
      tone: 'rule',
      title: 'Structure: callback + how you felt + concrete next step',
      blocks: [
        {
          kind: 'script',
          lines: [
            {
              text: '“Still thinking about your position on airport terminals — genuinely unhinged and I respect it. I had a great time tonight. Thursday for that ramen?”',
            },
          ],
        },
        {
          kind: 'paragraph',
          text: 'The **callback** proves you were present and creates a private joke. The **feeling** is direct and unguarded, which is rarer and more attractive than cool. The **next step** gives her something concrete to say yes to instead of leaving it to evaporate.',
        },
      ],
    },

    { kind: 'heading', level: 4, text: 'Three templates' },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'It was great',
          text: '“I had a really good time tonight — you’re funnier than your profile lets on. Let’s do it again. Are you free Thursday or Saturday?”',
        },
      ],
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'Decent; curious but not certain',
          text: '“Good time tonight, thanks for coming out. Would be up for a round two if you would.”',
        },
      ],
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'It’s a no',
          text: '“Hey — I enjoyed meeting you last night, but I don’t think we’re a romantic match. Wishing you the best out there.”',
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'On the “no” text' },
    {
      kind: 'paragraph',
      text: 'Send it, within a day or two. Ghosting seems like the low-cost option and it isn’t: it leaves someone checking their phone for a week, it’s the single most common complaint people have about modern dating, and it slowly makes *you* worse — someone who avoids every uncomfortable two-line conversation. The text above takes eleven seconds and it’s the version of yourself you’d rather be.',
    },
    {
      kind: 'paragraph',
      text: 'Don’t explain why unless asked. Don’t offer friendship as a consolation prize unless you mean it and would follow through.',
    },

    { kind: 'heading', level: 3, text: 'Reading her reply without spiraling' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Fast, warm, proposes a day** → excellent.',
        '**Fast and warm, no day proposed** → good; you propose one.',
        '**Slow but substantive** → probably fine. Some people are just bad at their phone. Fifteen hours is not a verdict.',
        '**Short, polite, no future tense** → likely a soft no. One more attempt is fine; two is not.',
        '**Nothing for 48 hours** → see below.',
      ],
    },
    {
      kind: 'paragraph',
      text: '**Do not analyze punctuation, emoji count, or response latency.** You will construct an entire narrative out of noise. The signal is: does she propose or accept a specific time? Everything else is static.',
    },

    { kind: 'heading', level: 3, text: 'If she goes quiet' },
    { kind: 'paragraph', text: '**Send one follow-up, three to four days later, and then stop.**' },
    {
      kind: 'script',
      lines: [
        {
          text: '“Hey — no pressure either way, but I’d still like to take you out. If the timing’s not right, all good.”',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: 'Nearly perfect: clear, explicitly releases her from obligation, and makes a non-response painless for both of you. If she doesn’t reply, you’re done. No third message, no “guess you’re not interested,” no “wow, okay.” Silence is an answer — accept it with dignity. Dating is a small world and how you handle a fade gets remembered.',
    },

    { kind: 'heading', level: 3, text: 'Planning date two' },
    {
      kind: 'paragraph',
      text: '**Escalate the format, not the budget.** Date one was drinks; date two should be *longer* and *more interactive*, not more expensive. Cooking something, a market, mini golf, a hike, a show, a neighborhood you both want to see. The goal is to do something *together* rather than sit across from each other again — shared activity generates a different and stronger kind of closeness than more conversation does.',
    },
    {
      kind: 'paragraph',
      text: 'And build it out of something she told you. That’s the highest-leverage thing you can do, and almost nobody does it.',
    },

    { kind: 'heading', level: 3, text: 'The post-date debrief' },
    {
      kind: 'paragraph',
      text: 'Within 24 hours, answer these five honestly. This is how you actually get better at dating.',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Did I like *her*, or did I like being liked?** The most important question here. They feel identical in the moment and they’re completely different things.',
        '**What did I actually learn about her?** If you can’t name three real things, you talked too much.',
        '**What did I do that wasn’t me?** Which opinions did you soften, which jokes did you swallow, where did you agree just to be agreeable? Those are the exact places a relationship built on this date would eventually break.',
        '**What was the best moment, and what caused it?** Almost always a moment of real disclosure or real laughter. Note what preceded it.',
        '**Would I be genuinely happy if she texted tomorrow — or just relieved?** Relief means it’s about your ego, not about her.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Handling rejection' },
    {
      kind: 'paragraph',
      text: '**The reframe:** a first date is a compatibility test with a low base rate of success, run between two strangers, over 90 minutes, on limited information. A “no” is overwhelmingly about fit, timing, someone else in the picture, or something in her life that has nothing to do with you. Treating each no as a verdict on your worth is both statistically wrong and self-destructive.',
    },
    {
      kind: 'paragraph',
      text: '**The timeline:** it stings for a day or two. Normal. If it’s flattening you for a week, the issue is that you had too few prospects and too much invested in one — a structural problem, fixable upstream.',
    },
    {
      kind: 'doDont',
      bad: 'Asking why, re-litigating over text, sending the “I just want to say” essay, or checking her profile repeatedly.',
      good: 'Reply once, briefly: “Totally understand. It was good meeting you, take care.” Then close it out and make the next plan.',
    },
    {
      kind: 'paragraph',
      text: 'The only real antidote to any single date mattering too much is more dates.',
    },
  ],
} as const satisfies GuidePart
