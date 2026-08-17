import type { GuidePart } from './types'

export const PART_03_DAY_OF = {
  id: 'day-of',
  number: 3,
  title: 'Day-Of: Grooming, Wardrobe, Mindset',
  summary: 'The ninety minutes before you walk in do more work than anything you’ll say.',
  icon: 'Sunrise',
  blocks: [
    { kind: 'heading', level: 3, text: 'Grooming' },
    {
      kind: 'paragraph',
      text: 'The bar is not “handsome.” The bar is **visibly, specifically cared for.** People notice effort more than genetics.',
    },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Haircut 3–7 days before**, not the day of. Fresh cuts look fresh; day-of cuts look severe.',
        '**Nails.** Trimmed and clean. This gets checked and it gets talked about. Four minutes.',
        '**Teeth and breath.** Brush, floss, tongue. Mint 10 minutes before, not while walking up.',
        '**Facial hair.** Cleanly shaved or deliberately, evenly shaped, neck line cleaned up. “Three days of not deciding” is the one to avoid.',
        '**Scent.** Shower, clean shirt, deodorant — that’s the actual bar. If you wear cologne: **two sprays maximum**, one chest, one neck or inner wrist. Never onto clothes. She should only notice it if she’s close. Someone who can smell you from six feet has been assaulted, not attracted. Unsure? Wear none.',
        '**Ears, nose, eyebrows.** Ninety seconds with a trimmer. Nobody compliments you for it; people notice when you skip it.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Wardrobe' },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Dress one notch above the venue.** Dive bar → dark jeans, clean boots, a shirt that fits. Cocktail bar → chinos or dark denim, button-down or good knit, maybe a jacket. Never the most dressed-up person in the room, never the least.',
        '**Fit beats brand, price, and style — by a wide margin.** A $30 shirt that fits your shoulders looks better than a $200 shirt that doesn’t. A tailor charges $15–25 to take in a shirt and it changes how you look more than a new wardrobe would.',
        '**Shoes get looked at.** Clean, in repair, appropriate to the venue. Not the sneakers you mow the lawn in.',
      ],
    },
    { kind: 'heading', level: 4, text: 'Three templates that work anywhere' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Casual:** dark straight-leg jeans + fitted solid tee or henley + light jacket or overshirt + clean leather sneakers or boots.',
        '**Smart casual:** chinos or dark denim + button-down (untucked, sleeves rolled once or twice) + Chelsea boots or minimal sneakers.',
        '**Elevated:** dark trousers + fine-gauge knit or crisp shirt + unstructured blazer + boots.',
      ],
    },
    {
      kind: 'paragraph',
      text: '**Avoid:** large logos, novelty graphics, unironed anything, oversized suits, indoor sunglasses, too much jewelry — and *anything you’ll fidget with because it’s uncomfortable.* Physical comfort beats the extra 5% of style; discomfort reads as nervousness.',
    },
    {
      kind: 'paragraph',
      text: '**One deliberate detail** — an interesting watch, a good jacket, well-chosen boots — beats five. It gives her something specific to comment on, which is a free conversational opening.',
    },

    { kind: 'heading', level: 3, text: 'The 90-minute pre-date routine' },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Eat something.** Arriving hungry makes you tense, and it makes one drink hit like three.',
        '**Hydrate.** Two glasses of water. Dry mouth is the physical symptom of nerves that makes them worse.',
        '**Move for 10–20 minutes.** Walk, pushups, anything. Adrenaline in a still body becomes anxiety; adrenaline in a moving body dissipates. Highest-return item on this list and the one most people skip.',
        '**Shower, then dress** — in that order, with time to change if something looks wrong.',
        '**One drink beforehand max, ideally zero.** Two is where you stop being sharp, and you cannot read her signals while managing your own buzz.',
        '**The warm-voice trick.** Talk to one human before you arrive — call a friend on the drive, chat with the barista. Cold-starting a conversation with the person you most want to impress is the hardest possible opening. Warm up on someone who doesn’t matter.',
        '**Phone on silent, in your pocket.** Not face-down on the table.',
        '**Look at her profile one last time** — name, two or three specifics, what you’ve already discussed. Then close it.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Nerves' },
    {
      kind: 'paragraph',
      text: 'Nerves aren’t a problem to eliminate. Everyone has them and they’re evidence you care. The goal is to keep them from driving.',
    },
    {
      kind: 'paragraph',
      text: '**The reframe that works:** anxiety and excitement are nearly the same physiological state — elevated heart rate, adrenaline, alertness. The interpretation is what differs, and the interpretation is somewhat under your control. Telling yourself “I’m excited” rather than “calm down” is meaningfully more effective, because you’re relabeling arousal rather than fighting it. Say it out loud in the car. It sounds stupid. It works better than trying to relax.',
    },
    {
      kind: 'paragraph',
      text: '**Box breathing** if you’re spiraling: in 4, hold 4, out 4, hold 4. Four rounds. Not magic — it just occupies the part of your brain rehearsing catastrophes.',
    },
    {
      kind: 'callout',
      tone: 'rule',
      title: 'The only three things you need in your head',
      blocks: [
        {
          kind: 'list',
          ordered: true,
          items: [
            'Her name, and two specifics from her profile.',
            'One story you can tell in 60 seconds if there’s a lull.',
            'The reminder: *I’m here to find out if I like her.*',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Do not memorize a list of questions. Memorized questions make you listen for your turn instead of listening to her, and that is instantly detectable.',
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'What to bring' },
    {
      kind: 'paragraph',
      text: 'Card *and* some cash (some good bars are cash-only; also useful for tipping). Gum or mints. A light jacket — partly for you, mostly because offering it if she’s cold is a real move that only works if you have one. Phone charged, on silent.',
    },
    {
      kind: 'paragraph',
      text: '**Don’t bring:** flowers or a gift (too much too soon, and now she has to carry it all night), a backpack, or anything you have to keep track of.',
    },

    { kind: 'heading', level: 3, text: 'Arrival' },
    {
      kind: 'paragraph',
      text: 'Get there 5–10 minutes early. **Do not sit in your car on your phone.** Go in, get the seats, order a water, and be a person who’s been having a fine evening already — not someone who’s been marinating in anticipation in a parking lot.',
    },
    {
      kind: 'paragraph',
      text: 'When she arrives: **stand up.** Phone away before she’s within twenty feet. Eye contact, a real smile, greet her by name.',
    },
  ],
} as const satisfies GuidePart
