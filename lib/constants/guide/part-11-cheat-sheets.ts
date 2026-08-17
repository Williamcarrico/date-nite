import type { GuidePart } from './types'

export const PART_11_CHEAT_SHEETS = {
  id: 'cheat-sheets',
  number: 11,
  title: 'Cheat Sheets',
  summary: 'The part you’ll actually reopen. Built to be read on a phone in sixty seconds.',
  icon: 'ListChecks',
  blocks: [
    { kind: 'heading', level: 3, text: 'Pre-date checklist' },
    {
      kind: 'paragraph',
      text: 'Tick these off as you go — they save between visits on this device.',
    },
    {
      kind: 'checklist',
      groups: [
        {
          id: 't-24h',
          title: 'T-24 hours',
          items: [
            { id: 't24-confirm', text: 'Confirmation text sent' },
            { id: 't24-venue', text: 'Venue confirmed — noise, seating, parking known' },
            { id: 't24-reservation', text: 'Reservation made if applicable' },
            { id: 't24-outfit', text: 'Outfit picked and checked' },
            { id: 't24-told-friend', text: 'Told a friend the plan and location' },
            { id: 't24-profile', text: 'Reread her profile — noted 2–3 specifics' },
          ],
        },
        {
          id: 't-2h',
          title: 'T-2 hours',
          items: [
            { id: 't2-ate', text: 'Ate something real' },
            { id: 't2-water', text: 'Water' },
            { id: 't2-groomed', text: 'Showered, groomed, nails, teeth, ≤2 sprays' },
            { id: 't2-moved', text: '10–20 minutes of movement' },
            { id: 't2-charged', text: 'Phone charged' },
            { id: 't2-carry', text: 'Card, cash, gum, light jacket' },
          ],
        },
        {
          id: 't-15min',
          title: 'T-15 minutes',
          items: [
            { id: 't15-silent', text: 'Phone on silent, in pocket' },
            { id: 't15-warm-voice', text: 'Talked to one human already' },
            { id: 't15-mints', text: 'Mints' },
            {
              id: 't15-mental',
              text: 'Her name + 2 specifics / one story / *I’m here to find out if I like her*',
            },
            { id: 't15-arrive', text: 'Arrive 5–10 min early, seat facing the door' },
          ],
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'Ten questions to have in your pocket' },
    {
      kind: 'list',
      ordered: true,
      items: [
        '“How’s your week been — actually, not the polite version?”',
        '“What’s been taking up most of your brain lately?”',
        '“What’s a completely irrational opinion you hold?”',
        '“What’s the best trip you’ve ever taken? Not the nicest — the best.”',
        '“What does a genuinely good week look like for you?”',
        '“What are you working on that has nothing to do with your job?”',
        '“What do people usually get wrong about you at first?”',
        '“What’s something you’ve changed your mind about recently?”',
        '“What’s the worst first date you’ve been on?”',
        '“What are you actually looking for right now?” *(back half only)*',
      ],
    },

    { kind: 'heading', level: 3, text: 'Five conversation repairs' },
    {
      kind: 'table',
      variant: 'pair',
      rowHeader: true,
      columns: [
        { key: 'situation', label: 'Situation' },
        { key: 'move', label: 'Move' },
      ],
      rows: [
        ['Dead air', 'Comment on the room → or a callback → or “Random question for you —”'],
        ['One-word answers', 'Stop asking questions. Switch to statements and observations.'],
        ['You’re monologuing', '“I’m talking a lot. Your turn — [question].”'],
        ['She’s monologuing', '“That’s wild, it reminds me of [short thing]. Do you find that too?”'],
        ['You said something dumb', '“That came out worse than I meant it. Let me try again.” Once. Then move.'],
      ],
    },

    { kind: 'heading', level: 3, text: 'Signal card' },
    {
      kind: 'table',
      variant: 'pair',
      columns: [
        { key: 'interested', label: 'Interested' },
        { key: 'not', label: 'Not interested' },
      ],
      rows: [
        ['Asks you questions back', 'Answers, never asks'],
        ['Volunteers information', 'Only responds to prompts'],
        ['Future tense: “you’d like…”', 'No future tense at all'],
        ['Says yes to extending, or suggests it', '“I should head out,” no counter'],
        ['Initiates touch', 'Re-opens the distance'],
        ['Laughs at non-jokes', 'Polite, flat, agreeable'],
        ['Stays past a stated constraint', 'Mentions an early morning twice'],
        ['Eye contact: break and return', 'Scanning the room, phone checks'],
      ],
    },
    {
      kind: 'paragraph',
      text: 'Weight what she **initiates**, not what she **accepts**.',
    },

    { kind: 'heading', level: 3, text: 'Three text templates' },
    {
      kind: 'script',
      lines: [
        { speaker: 'Confirm — day before, afternoon', text: '“Still on for tomorrow at 7? Looking forward to it.”' },
      ],
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'Follow-up — that night or next morning',
          text: '“[Callback to something specific she said]. I had a great time tonight. [Day] — you in?”',
        },
      ],
    },
    {
      kind: 'script',
      lines: [
        {
          speaker: 'Decline — within a day or two',
          text: '“Hey — I enjoyed meeting you last night, but I don’t think we’re a romantic match. Wishing you the best out there.”',
        },
      ],
    },

    {
      kind: 'keyPoints',
      title: 'If you remember nothing else',
      items: [
        '**You’re evaluating too.** That’s not an attitude, it’s accurate.',
        '**Cheap, short, and easy to extend** beats expensive and locked-in.',
        '**Pick a quiet place with side-by-side seating.** Noise kills more first dates than personality does.',
        '**Statement, then question.** Never fire naked questions.',
        '**Pull the thread.** Three follow-ups on one topic beats one question about six.',
        '**Go first on depth.** Never ask for vulnerability you haven’t offered.',
        '**Callbacks build chemistry** faster than anything else you can do.',
        '**Judge by what she initiates**, not what she accepts.',
        '**Leave while it’s still good**, and ask for date two in person.',
        '**Text the next morning.** Say you had a good time. Name a day.',
      ],
    },
  ],
} as const satisfies GuidePart
