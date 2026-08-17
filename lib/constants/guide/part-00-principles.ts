import type { GuidePart } from './types'

export const PART_00_PRINCIPLES = {
  id: 'operating-principles',
  number: 0,
  title: 'Operating Principles',
  summary: 'The five ideas everything else in the guide comes out of.',
  icon: 'Compass',
  blocks: [
    {
      kind: 'paragraph',
      text: 'Everything in this guide comes out of five ideas. Internalize these and most of the specific advice becomes obvious.',
    },

    { kind: 'heading', level: 3, text: '1. A first date is a compatibility audit, not an audition.' },
    {
      kind: 'paragraph',
      text: 'The default mental frame — *I hope she likes me* — is the single biggest source of bad first dates. It makes you perform, agree too much, laugh at things that aren’t funny, and avoid saying anything that could be disagreed with. The result is a pleasant, forgettable, chemistry-free hour.',
    },
    {
      kind: 'paragraph',
      text: 'The correct frame: **you are both evaluating.** You are finding out whether you actually enjoy this person’s company — not whether you can pass her test.',
    },
    {
      kind: 'paragraph',
      text: 'This isn’t a confidence affirmation, it’s an accuracy correction. You genuinely don’t know yet whether you like her. A great profile and good texting predict almost nothing about in-person chemistry. Treating the date as an evaluation you’re conducting is simply true — and it happens to also produce the relaxed, curious, non-needy presence people find attractive.',
    },
    {
      kind: 'paragraph',
      text: '**Practical consequence:** you’re allowed to disagree, to have opinions, to say “I don’t get that,” to not laugh at something that wasn’t funny. Mild friction is what makes a conversation feel real.',
    },

    { kind: 'heading', level: 3, text: '2. Low stakes beat high stakes.' },
    {
      kind: 'paragraph',
      text: 'A $14 coffee that can run 45 minutes or 3 hours is a better first date than a $180 dinner reservation. Every time.',
    },
    {
      kind: 'paragraph',
      text: 'A big-production date front-loads pressure onto two strangers. It creates an obligation to have a good time, a fixed duration you can’t shorten, and an implied score to live up to. Cheap and short does the opposite — it removes the pressure, which is exactly the condition under which chemistry actually appears.',
    },

    { kind: 'heading', level: 3, text: '3. Interest is created by attention, not by impressiveness.' },
    {
      kind: 'paragraph',
      text: 'People rate conversations by how they *felt*, not by what they *learned*. The strongest driver of “that felt great” is being genuinely listened to.',
    },
    {
      kind: 'paragraph',
      text: 'Aim for roughly **40% talking, 60% listening** — but the number matters less than the quality. Ten minutes of real follow-up questions about her actual answer beats ten minutes of your best material.',
    },
    {
      kind: 'paragraph',
      text: 'This is not “don’t talk about yourself.” You have to. A date where you only ask questions is an interrogation and she’ll leave knowing nothing about you. The rule is: **you give, then you ask.**',
    },

    { kind: 'heading', level: 3, text: '4. Calibration beats technique.' },
    {
      kind: 'paragraph',
      text: 'Every rule here is a starting position on a dial, not a fixed setting. “Keep it to 90 minutes” is right about 80% of the time. The other 20% you’re three hours in and it’s the best conversation you’ve had in a year — stay.',
    },
    {
      kind: 'paragraph',
      text: 'The skill isn’t knowing the rules. It’s noticing when the person in front of you is an exception. Techniques applied without reading the room are worse than no technique at all, because they read as scripted.',
    },

    { kind: 'heading', level: 3, text: '5. Outcome independence.' },
    {
      kind: 'paragraph',
      text: 'The posture that makes you attractive and the posture that makes rejection survivable are the same posture: *I’d like this to work, and I’m fine if it doesn’t.*',
    },
    {
      kind: 'paragraph',
      text: 'You cannot fake this. You build it structurally — by having a life full enough that one date doesn’t carry much weight, and by going on enough dates that no single one is precious. Neediness isn’t a personality flaw, it’s a math problem. When you have one prospect, every interaction is high-stakes and you behave accordingly. The fix is upstream of the date.',
    },
  ],
} as const satisfies GuidePart
