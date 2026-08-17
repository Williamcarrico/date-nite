import type { GuidePart } from './types'

export const PART_02_CHOOSING = {
  id: 'venue-format-timing',
  number: 2,
  title: 'Choosing the Date: Venue, Format, Timing',
  summary: 'What to do, where, when — and the two-part structure that makes any of it work.',
  icon: 'MapPin',
  blocks: [
    { kind: 'heading', level: 3, text: 'The format matrix' },
    {
      kind: 'paragraph',
      text: 'Rate every idea on four axes: cost, conversation quality (can you actually talk?), exit ease (can it end gracefully at 45 minutes?), and vibe (does it feel like a date or a meeting?).',
    },
    {
      kind: 'table',
      variant: 'matrix',
      columns: [
        { key: 'format', label: 'Format' },
        { key: 'cost', label: 'Cost' },
        { key: 'conversation', label: 'Conversation' },
        { key: 'exit', label: 'Exit ease' },
        { key: 'vibe', label: 'Vibe' },
        { key: 'verdict', label: 'Verdict' },
      ],
      rows: [
        ['**Drinks at a good bar**', '$', 'Excellent', 'Excellent', 'Strong', '**The default.** Best overall.'],
        ['**Coffee**', '$', 'Excellent', 'Excellent', 'Weak–moderate', 'Great for daytime and non-drinkers. Slightly platonic — fix with a walk.'],
        ['**Coffee or drinks + a walk**', '$', 'Excellent', 'Excellent', 'Strong', '**The best version of the default.**'],
        ['**Casual dinner**', '$$', 'Good', 'Poor', 'Strong', 'Fine if you’ve spoken by phone. Otherwise the 90-minute lock-in is a real risk.'],
        ['**Farmers market**', '$', 'Very good', 'Very good', 'Moderate', 'Underrated. Movement, stimulus, natural topics. Daytime only.'],
        ['**Bookstore + coffee**', '$', 'Very good', 'Very good', 'Moderate', 'Excellent for readers. Browsing reveals taste fast.'],
        ['**Mini golf / arcade**', '$$', 'Moderate', 'Moderate', 'Strong (playful)', 'Fun, built-in teasing. Weak for deep conversation. Good second date.'],
        ['**Museum / gallery**', '$–$$', 'Good', 'Good', 'Moderate', 'Great if she’s into it, deadly if she isn’t.'],
        ['**Live music**', '$$', 'Poor', 'Poor', 'Strong', 'Can’t talk. Only works as Act 2.'],
        ['**Dog park / hike**', '$', 'Very good', 'Moderate', 'Moderate', 'Side-by-side lowers pressure. Only with someone you’ve spoken to.'],
        ['**Movie**', '$$', 'None', 'Poor', 'Weak', '**Never.** Two hours of not speaking.'],
        ['**Cooking class**', '$$$', 'Good', 'None', 'Strong', 'Fun, but expensive and totally locked in. Third date material.'],
      ],
    },

    { kind: 'heading', level: 3, text: 'The recommended default' },
    {
      kind: 'paragraph',
      text: '**Drinks (or coffee) at a place with good seating and low noise, 90 minutes, with an optional walk after.**',
    },
    {
      kind: 'paragraph',
      text: 'It’s cheap. You can hear each other. You can leave at 45 minutes or stay at 3 hours and both are natural. It’s unambiguously a date. And the optional walk gives you a free Act 2 that costs nothing.',
    },
    {
      kind: 'paragraph',
      text: '**Break the default when:** you’ve already talked on the phone and have real rapport (dinner becomes viable), she has a strong specific interest you can build around, or one of you doesn’t drink and daytime works better.',
    },

    { kind: 'heading', level: 3, text: 'Never on a first date' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**A movie.** You cannot get to know someone in silence.',
        '**Dinner with someone you’ve never spoken to out loud.** If the conversation dies at minute 20, you have 70 minutes and two entrées to get through.',
        '**Anything over three hours locked in.** Concerts, sporting events, two-drink-minimum comedy shows.',
        '**Anything you can’t leave.** No boats, no long hikes, nothing forty minutes out of town.',
        '**Riding together.** Separate cars, always, both directions. Safety baseline for her, and it protects you from a stranded, awkward ride home.',
        '**Your place or hers.** Even just for dinner. It removes her ability to exit, and a first date where she doesn’t feel free to leave is not a good first date.',
        '**Somewhere you’re a regular.** You want her attention, not the bartender’s.',
      ],
    },

    { kind: 'heading', level: 3, text: 'The two-part structure' },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Highest-leverage planning trick',
      blocks: [
        {
          kind: 'paragraph',
          text: '**Act 1 is fixed. Act 2 is optional.** Book one drink at one bar. Have a second thing in mind — a walk, a dessert spot, the pier — that you never mention unless it’s going well.',
        },
        {
          kind: 'script',
          lines: [
            {
              text: '“I’m having a good time. There’s a [gelato place / bookstore / spot with a view] two blocks from here — want to keep going?”',
            },
          ],
        },
      ],
    },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**If it’s going well:** the date extends naturally and gains a new setting. A change of location resets energy and makes 2 hours feel like 2 dates — a shared walk produces more felt intimacy than the same time in one chair.',
        '**If it’s not:** you finish the drink and go home. No awkward extraction, no faked enthusiasm.',
        '**Either way you look good.** Extending was your idea and declining doesn’t insult anyone.',
      ],
    },
    {
      kind: 'paragraph',
      text: 'Never announce the two-part plan in advance. “So we’ll get drinks and then walk and then get dessert” turns it into an itinerary she has to commit to. The whole value is in the optionality.',
    },

    { kind: 'heading', level: 3, text: 'Venue selection checklist' },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Noise.** *The single most common venue mistake.* If you have to lean in and repeat yourself, the conversation cannot go anywhere real. Check reviews for the word “loud.” A great bar Saturday at 9 is a terrible bar for a first date; the same bar Tuesday at 7 is perfect.',
        {
          text: '**Seating**, in order of quality:',
          children: [
            '**Bar seats, side by side** — best. Lowers eye-contact pressure, makes silences comfortable, puts you naturally close.',
            '**Corner booth or small round table** — very good. Angled rather than confrontational.',
            '**Large rectangular table, four feet apart, facing off** — worst. It’s an interview setup, physically and psychologically.',
          ],
        },
        '**Lighting.** Dim but not dark. Everyone looks better and feels less exposed. Fluorescent overheads kill the mood.',
        '**Crowd density.** Some ambient buzz is good — total silence makes you both self-conscious about being overheard. Shoulder-to-shoulder is bad.',
        '**Distance.** Convenient for *her*, not you. A 35-minute drive against your 5 starts the night with an imbalance, and near her neighborhood is the safer, more considerate option.',
        '**Parking.** If it’s a nightmare, tell her where to park. She’ll arrive un-frustrated, which improves the first five minutes.',
        '**Exits and layout.** Visible exit, staffed bar, other people. Standard safety practice, and it makes her more comfortable whether or not she consciously registers it.',
        '**A place you’ve been.** Knowing the layout, the menu, and where the bathroom is removes a dozen frictions. Don’t test-drive a new spot on a first date.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Timing' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Weeknights, 6:30–7:30 PM, are underrated.** Lower pressure than a Friday, quieter venues, and the implied school night gives you both a blame-free hard stop. That constraint is an *asset* — it makes leaving-while-it’s-good easy.',
        '**Weekend evenings** are higher-signal (she gave up prime social time) but louder and higher-pressure.',
        '**Daytime coffee** is the lowest-stakes option and perfectly good, especially for a first app meet. Slightly less romantic charge; a walk fixes it.',
        '**8:30 PM+ starts** shift the frame toward “this is going somewhere tonight.” Fine if mutual, but it selects for a different kind of date.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Budget' },
    {
      kind: 'paragraph',
      text: 'Plan on **$30–70 total.** Two drinks each, or coffee and a snack, plus a good tip and maybe dessert on the walk.',
    },
    {
      kind: 'paragraph',
      text: 'Do not spend $200 — not because of the money, but because of what it signals. A lavish first date communicates either that you’re trying to buy an outcome or that you’re demonstrating status. Both put her in the position of owing you something, and **feeling indebted is the opposite of feeling attracted.** Save the expensive dinner for date three, when it’s a treat rather than a test. Tip well; she’s watching, and she should be.',
    },

    { kind: 'heading', level: 3, text: 'Small logistics that matter' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Reservation** if the place takes them, even for two at a bar. Standing around waiting is a bad first fifteen minutes.',
        '**Arrive 5–10 minutes early**, take the seats you want, know where the restroom is.',
        '**Sit facing the door** so you see her arrive and can stand to greet her.',
      ],
    },
  ],
} as const satisfies GuidePart
