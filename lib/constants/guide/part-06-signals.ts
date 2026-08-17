import type { GuidePart } from './types'

export const PART_06_SIGNALS = {
  id: 'signals-and-chemistry',
  number: 6,
  title: 'Reading Signals & Chemistry',
  summary: 'What she initiates, not what she accepts — plus flirting calibration and red flags.',
  icon: 'Radar',
  blocks: [
    {
      kind: 'callout',
      tone: 'warning',
      title: 'A caveat worth stating first',
      blocks: [
        {
          kind: 'paragraph',
          text: '**Body-language reading is much less reliable than pop psychology claims.** Individual gestures mean almost nothing — crossed arms often just means she’s cold. What’s actually informative is (a) *clusters* of signals, (b) *changes* from her own baseline over the evening, and above all (c) **what she initiates.** Weight the behavioral signals heavily and the postural ones lightly.',
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'Interest indicators, roughly by reliability' },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**She asks you questions back.** The single most reliable signal. Genuine curiosity is very hard to fake for 90 minutes.',
        '**She volunteers information you didn’t ask for.** Unprompted disclosure means she wants you to know her.',
        '**Future-tense language.** “You’d like that place.” “You have to try the—” Her brain is modeling a next time. Enormous.',
        '**She says yes to extending**, or proposes it herself. Behavioral, costly, unambiguous.',
        '**She initiates touch.** A hand on your arm while laughing, a shoulder bump on the walk. Very high signal.',
        '**Sustained eye contact with a break-and-return.** The return is the tell.',
        '**She laughs at things that aren’t quite jokes.** Excess laughter is a warmth signal, not a comedy review.',
        '**Proximity.** Leaning in, turning her stool toward you, not re-establishing the gap after it closes.',
        '**Mirroring your posture or drink rhythm.** Real, but weak individually.',
        '**She stays past a stated constraint.** She said she had to be up at 5 and it’s 11:30. Decisions outweigh gestures.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Disinterest indicators' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Short answers with no reciprocal questions.** The clearest one. Eight questions asked, zero received — that’s the date.',
        '**No future-tense language at all.**',
        '**Repeated phone checks**, especially while you’re talking.',
        '**Scanning the room** past the first few minutes.',
        '**Polite but flat.** Hardest to read because it *looks* fine — but there’s no energy, no follow-ups, no volunteering.',
        '**Physically re-establishing distance** after it closes.',
        '**Declining to extend, with no counter-proposal.**',
        '**Mentions an early morning twice.** Once is information; twice is an exit being built.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Nervous vs. uninterested' },
    {
      kind: 'paragraph',
      text: 'People routinely conclude “she’s not into me” when she’s simply anxious. Three ways to tell them apart:',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Does she recover?** Nervousness decays as comfort builds. Stiff at minute 5 and warmer at minute 30 means nerves. Minute 45 flatter than minute 10 means disinterest.',
        '**Is there effort behind the awkwardness?** A nervous person gives a short answer *and then adds to it* — “Yeah. Um, actually — it’s more like...” An uninterested person gives a short answer and stops.',
        '**Does she track you?** Nervous people still look at you, still laugh, still lean in. Disinterested people orient away.',
      ],
    },
    {
      kind: 'paragraph',
      text: 'If it’s nerves: **lower the pressure.** Fewer questions, more statements, more self-deprecation, more warmth. Talk about something small and dumb. Let her land.',
    },

    { kind: 'heading', level: 3, text: 'The politeness problem' },
    {
      kind: 'paragraph',
      text: 'Many people — women especially, and for entirely rational safety reasons — will not signal disinterest directly. They’ll stay pleasant, agree, laugh, and answer questions for two hours, then never reply again. That isn’t dishonesty; it’s a learned strategy for exiting a situation with a stranger safely.',
    },
    {
      kind: 'callout',
      tone: 'rule',
      title: 'The correction',
      blocks: [
        {
          kind: 'paragraph',
          text: '**Weight what she initiates, not what she accepts.** Accepting a second drink is weak evidence; *ordering* one is strong. Answering your question is weak; *asking you one* is strong. Agreeing to a walk is weak; *suggesting where* is strong.',
        },
        {
          kind: 'paragraph',
          text: 'And the corollary: **make it easy for her to leave.** Give her clean, face-saving exits — “If you need to get going, no problem at all.” Someone who feels free to leave and stays anyway has told you something real. Someone who feels trapped can’t tell you anything at all.',
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'Flirting: the escalation ladder' },
    {
      kind: 'paragraph',
      text: 'Each rung requires a reciprocal signal before the next. **You never take two rungs in a row without her taking one.**',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Sustained eye contact and a real smile.** Always available.',
        '**Playful teasing / mock disagreement.** Reciprocal to look for: does she tease back?',
        '**Specific compliments on chosen traits.** Does she hold the compliment and engage, or deflect and change subject?',
        '**Undivided attention and warmth.** Phone gone, body turned, genuine focus. Deeply underrated as flirting. Does she close distance?',
        '**Reduced physical distance.** Turn toward her, lean in during a story. Does she stay in the closed distance, or reset it?',
        '**Brief incidental touch.** A hand on her forearm for one to two seconds while making a point; a light touch guiding her through a doorway. **Two seconds, then withdraw.** The withdrawal matters as much as the touch — it makes the gesture confident rather than lingering, and hands the next move back to her. Does she touch you back?',
        '**Sustained contact.** Holding a hand on the walk. Only after she has initiated touch at least once.',
        '**A kiss.** See Part 07.',
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Calibration rules',
      blocks: [
        {
          kind: 'list',
          ordered: false,
          items: [
            '**A neutral response is a no, not a maybe.** If she doesn’t reciprocate, hold the current rung. Don’t push and don’t sulk.',
            '**A step back is a full stop on that dimension.** If she pulls away from a touch, don’t touch again for a good while. Nothing is ruined — but re-approaching immediately is.',
            '**Nothing you do should require her to say no.** Structure your moves so that “she didn’t reciprocate” is enough for you to stop, without her having to spend the social cost of a refusal.',
          ],
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'Consent, practically' },
    {
      kind: 'paragraph',
      text: 'Consent isn’t a checkpoint you clear once. It’s a continuous read, and it runs in both directions.',
    },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**The two-second rule for touch.** Any new touch is brief and then released. It’s an offer, not a claim.',
        '**Enthusiasm is the bar, not the absence of “no.”** She stiffened, went quiet, smiled tightly, got busy with her drink — all of those are answers.',
        '**Asking can be a flirt, not a permission form.** “I’ve been wanting to kiss you for the last twenty minutes,” delivered with eye contact and a pause, isn’t clinical — it’s direct, and directness is attractive. “Is it okay if I kiss you?” also works. Both beat lunging.',
        '**Alcohol changes the math.** If either of you is past a couple of drinks, everything physical should slow down, not speed up. Someone who’s genuinely into you tonight will be genuinely into you sober on Thursday.',
        '**“No” gets accepted the first time**, cleanly, without a mood change. How you receive a no is more revealing than anything else you’ll do all night — and the graceful version very often leads somewhere later.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Attraction vs. compatibility' },
    { kind: 'paragraph', text: 'Two separate axes. Confusing them costs years.' },
    {
      kind: 'table',
      variant: 'quadrant',
      rowHeader: true,
      columns: [
        { key: 'axis', label: '' },
        { key: 'high-compat', label: 'High compatibility' },
        { key: 'low-compat', label: 'Low compatibility' },
      ],
      rows: [
        ['High attraction', 'Rare. This is the one.', '**The trap.** Feels the most intense, ends the worst.'],
        ['Low attraction', 'The “good on paper” friend. Real affection, no spark.', 'Easy no.'],
      ],
    },
    {
      kind: 'paragraph',
      text: 'High-attraction / low-compatibility is dangerous precisely because it produces the strongest feelings. Intensity and volatility are correlated — a connection that feels overwhelming at hour two is often generating that heat from instability, not from fit.',
    },
    { kind: 'heading', level: 4, text: 'Three compatibility questions to answer before you leave' },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**How does she treat the staff?** The most reliable character read available on a first date, full stop. Someone warm to you and dismissive to a server has shown you exactly who they are — you’re just currently in the category being performed for.',
        '**How does she handle small friction?** The wrong order, the wait, the rain. Everyone is pleasant when things go smoothly. The response to a minor inconvenience is a preview.',
        '**Does her idea of a good life overlap with yours?** Not her job — her *life.* You don’t need to match. You need to not be in conflict.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Red flags worth ending on' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Contempt toward service staff.** Number one, and non-negotiable.',
        '**Boundary testing.** Pushing after a “no” on anything — another drink, a location change, a touch. If she doesn’t respect a small no, larger ones won’t fare better.',
        '**Pressure around drinking, leaving, or going somewhere private.**',
        '**Global hostility about an entire gender or “all my exes.”** One difficult ex is a story. Everyone she’s dated being crazy means she’s the constant.',
        '**Love-bombing.** Overwhelming intensity at hour one — soulmate talk, aggressive future-planning, extravagant compliments about a person she’s known forty minutes. That’s not romance; it’s speed, and speed is how people get past your judgment.',
        '**Material inconsistency with her profile or texts.** Small mismatches are nothing; substantive ones are a pattern.',
        '**Any request involving money.** No exceptions on a first date. None.',
        '**Cruelty presented as honesty.**',
      ],
    },

    {
      kind: 'callout',
      tone: 'insight',
      title: 'Your own side of the ledger',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Honestly: Did you interrupt? Check your phone? Talk more than half the date? Push a rung she didn’t reciprocate? Get short with anyone? Ask her a single question you were actually curious about?',
        },
        {
          kind: 'paragraph',
          text: 'Running this list after every date improves you faster than any technique in this guide.',
        },
      ],
    },
  ],
} as const satisfies GuidePart
