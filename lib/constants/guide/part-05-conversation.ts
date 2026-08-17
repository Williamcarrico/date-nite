import type { GuidePart } from './types'
import { QUESTION_GROUPS } from './part-05-question-bank'

export const PART_05_CONVERSATION = {
  id: 'conversation-engine',
  number: 5,
  title: 'The Conversation Engine',
  summary: 'The core of the guide. Everything else is logistics.',
  icon: 'MessageCircle',
  blocks: [
    { kind: 'heading', level: 3, text: 'The three tiers' },
    { kind: 'paragraph', text: 'Every conversation operates at one of three depths. Good dates climb.' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Tier 1 — Facts.** Where you’re from, what you do, siblings, the commute. Necessary but inert. Nobody has ever fallen for someone because of their job title. **Budget 5–10 minutes, total.** Most bad dates never leave Tier 1 — they exchange résumés for an hour and go home.',
        '**Tier 2 — Opinions, preferences, stories.** What she loves, what irritates her, the best trip she ever took, why that movie is overrated. This is where a date becomes *fun.* Humor lives here. So does disagreement.',
        '**Tier 3 — Values, fears, self-revelation.** What she’s building toward. What scares her. What changed her. **This is where attraction actually forms** — mutual, escalating self-disclosure is one of the most reliably documented drivers of felt closeness between strangers.',
      ],
    },
    {
      kind: 'callout',
      tone: 'rule',
      title: 'The climbing rules',
      blocks: [
        {
          kind: 'list',
          ordered: true,
          items: [
            '**You go first.** Never ask a Tier 3 question you haven’t already answered about yourself. Asking someone to be vulnerable while you stay behind glass is extractive, and people feel it even when they can’t name it.',
            '**One rung at a time.** 1 → 2 → 3. Skipping produces whiplash.',
            '**Never climb faster than she does.** If you offer a Tier 3 disclosure and she answers at Tier 1, drop back down and try again in fifteen minutes. Pushing depth against resistance is the most common way a well-intentioned person makes someone uncomfortable.',
            '**You can go back down.** Great conversations oscillate — something heavy, then a joke, then something real. An hour at Tier 3 is exhausting, not intimate.',
          ],
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'The three techniques that carry 80% of it' },

    { kind: 'heading', level: 4, text: '1 · Thread-pulling' },
    {
      kind: 'paragraph',
      text: '**Every answer contains two or three hooks. Pull the interesting one instead of asking your next question.**',
    },
    {
      kind: 'script',
      lines: [
        { speaker: 'You', text: '“What do you do?”' },
        {
          speaker: 'Her',
          text: '“I’m a nurse — night shift at Baptist. I actually moved here from Denver two years ago for it.”',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: 'Three threads: *nurse*, *night shift*, *left Denver*. The boring move abandons all three: “cool, and do you like it?” The good move pulls whichever is most alive:',
    },
    {
      kind: 'script',
      lines: [
        {
          text: '“You *left Denver* for Florida? Most of the traffic goes the other direction. What made you do it?”',
        },
        { text: '“Night shift — does your sense of time just permanently break, or do you adapt?”' },
      ],
    },
    {
      kind: 'paragraph',
      text: 'This is the physical difference between a conversation and an interview. An interview is a list of questions asked in sequence; a conversation is a chain where each link comes out of the last thing said. It also proves you were listening, which is worth more than any specific thing you could say.',
    },
    {
      kind: 'paragraph',
      text: '**How to practice:** while she’s talking, don’t prepare your response. Just note which part you’re actually curious about. That’s the thread. If you’re genuinely curious about none of it, that’s real information about compatibility.',
    },

    { kind: 'heading', level: 4, text: '2 · Statement + question' },
    {
      kind: 'paragraph',
      text: '**Never fire a naked question. Give something of yours first, then ask.**',
    },
    {
      kind: 'doDont',
      bad: '“What do you do for fun?”',
      good: '“I’ve been getting obsessive about cooking lately — I made a genuinely terrible risotto last Sunday. What’s your thing outside of work?”',
    },
    {
      kind: 'paragraph',
      text: 'The naked version is an interrogation prompt. The second does four things at once: reveals something about you, is slightly self-deprecating so she knows the bar isn’t high, models the *depth* of answer you want, and gives her something to grab if her own answer is thin (“wait, what happened with the risotto?”).',
    },
    {
      kind: 'paragraph',
      text: 'This one technique eliminates the interview feel almost completely. If you fix nothing else, fix this. **Failure mode:** making the statement too long. Two sentences, then the question. Four sentences and you’ve made it about you.',
    },

    { kind: 'heading', level: 4, text: '3 · The follow-up ladder' },
    {
      kind: 'paragraph',
      text: 'Most people ask one question and move on. Depth comes from going **two rungs past where a normal person stops.**',
    },
    {
      kind: 'script',
      lines: [
        { speaker: 'What', text: '“You went to Peru?”' },
        { speaker: 'How', text: '“How did that even come together?”' },
        { speaker: 'Why', text: '“Why Peru, though? Of all the places.”' },
        { speaker: 'Feeling', text: '“Was it what you hoped it’d be?”' },
      ],
    },
    {
      kind: 'paragraph',
      text: 'That last rung is where the good stuff is — it invites reflection rather than recitation, and reflection is what makes people feel known. Three follow-ups on one topic beats one question about six topics, every time.',
    },
    {
      kind: 'paragraph',
      text: '**Failure mode:** laddering on a topic she’s clearly finished with. If her answers get shorter as you dig, you’re excavating, not conversing. Change subject.',
    },

    { kind: 'heading', level: 3, text: 'The question bank' },
    {
      kind: 'questionBank',
      intro:
        'Do not memorize these. Read them once the day before, absorb the *shape*, and let two or three float up naturally. A memorized list makes you wait for your turn instead of listening.',
      groups: QUESTION_GROUPS,
    },

    { kind: 'heading', level: 4, text: 'Never ask on a first date' },
    {
      kind: 'table',
      variant: 'pair',
      rowHeader: true,
      columns: [
        { key: 'question', label: 'Question' },
        { key: 'why', label: 'Why it backfires' },
      ],
      rows: [
        [
          '“Why are you single?”',
          'Framed as a defect that needs explaining. Nobody has a good answer, and the answer they give is defensive.',
        ],
        ['“How much do you make?” / “What’s your rent?”', 'Money on a first date reads as evaluation of assets.'],
        ['“How many people have you slept with?”', 'There’s no answer that improves your evening.'],
        [
          '“What went wrong with your ex?”',
          'Pulls the mood down for twenty minutes and puts her ex in the chair with you.',
        ],
        ['“Do you want to get married?” (early)', 'Fine as a values conversation later. On date one it’s a pressure test.'],
        ['“What’s your biggest insecurity?”', 'Vulnerability requested, not offered. Extractive.'],
        ['“Are we going to your place or mine?” (early)', 'You’ll know if it’s on the table. Asking early forecloses it.'],
        [
          '“Why didn’t you text back yesterday?”',
          'You have no standing yet, and it establishes surveillance as the dynamic.',
        ],
        [
          'Anything that requires her to reassure you',
          '“You’re probably too good for me,” “I’m bad at this” — puts her in the caretaking role five minutes in.',
        ],
      ],
    },

    { kind: 'heading', level: 3, text: 'Conversation keys — the small mechanics' },

    { kind: 'heading', level: 4, text: 'Callbacks' },
    {
      kind: 'paragraph',
      text: 'Reference something she said twenty minutes ago and connect it to now.',
    },
    {
      kind: 'script',
      lines: [
        { text: '“See, this is the same energy as the Denver thing.”' },
        { text: '“Okay, this is officially your second unhinged opinion of the night.”' },
      ],
    },
    {
      kind: 'paragraph',
      text: 'The single strongest chemistry-builder available, and nearly free. It proves retention, creates a private shared language, and by minute 60 you have inside jokes — which is exactly what makes a first date feel like a third. **Deploy at least three over the evening.**',
    },

    { kind: 'heading', level: 4, text: 'Playful challenge' },
    {
      kind: 'paragraph',
      text: 'Light, specific disagreement. *“That is objectively the worst take I’ve heard this month.” “I’m genuinely reconsidering this whole evening.”* Agreeing with everything makes you invisible. Mild friction creates tension, and tension is a component of attraction. It also signals you’re not trying to be liked at any cost.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'The calibration line',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Tease **choices, tastes, and stated opinions.** Never appearance, insecurities, family, career, or anything she’s shown you is tender. The test: would she repeat this line to a friend with a laugh, or would it sting on the drive home?',
        },
        {
          kind: 'paragraph',
          text: 'Warm face and she laughs → escalate slightly. She goes flat → drop it entirely and don’t return to it. **She teases you back → strong signal, lean in.**',
        },
      ],
    },

    { kind: 'heading', level: 4, text: 'The two-second pause' },
    {
      kind: 'paragraph',
      text: 'When she finishes a sentence, don’t answer instantly. Let a beat sit. It signals you’re considering rather than waiting, and it often prompts her to add the more interesting second half she was deciding whether to say. Most people talk over that gap. Don’t.',
    },

    { kind: 'heading', level: 4, text: 'Mirroring' },
    {
      kind: 'paragraph',
      text: 'Roughly match her energy, volume, and pace. If she’s low-key and thoughtful, big performance energy feels like being run over. If she’s animated and fast, sitting there placidly reads as bored. Don’t mimic gestures — that’s a parlor trick and it looks strange. Match the tempo.',
    },

    { kind: 'heading', level: 4, text: 'Yes-and' },
    {
      kind: 'paragraph',
      text: 'Improv logic. Take what she offers and build on it rather than redirecting to your own material.',
    },
    {
      kind: 'script',
      lines: [{ speaker: 'Her', text: '“I have a genuinely deranged theory about airport terminals.”' }],
    },
    {
      kind: 'doDont',
      bad: '“Ha, yeah, airports are wild. Anyway, my flight last month—”',
      good: '“You cannot say ‘deranged theory’ and then not deliver. Go.”',
    },

    { kind: 'heading', level: 4, text: 'The three phrases that make people open up' },
    {
      kind: 'list',
      ordered: true,
      items: ['“Tell me more about that.”', '“Wait, go back — what do you mean?”', '“What was that like?”'],
    },
    {
      kind: 'paragraph',
      text: 'Simple to the point of feeling like a cheat. They work because almost nobody says them.',
    },

    { kind: 'heading', level: 4, text: 'Her name, and one more thing' },
    {
      kind: 'paragraph',
      text: 'Use her name two or three times over the whole date — greeting, once in the middle, goodbye. Every third sentence is a sales technique and reads as one.',
    },
    {
      kind: 'paragraph',
      text: '**Don’t correct her on trivia.** If she gets the year or the director wrong, let it go. Being right about something small at the cost of the mood is the worst trade on the board.',
    },

    { kind: 'heading', level: 3, text: 'Storytelling: how to be worth listening to' },
    {
      kind: 'paragraph',
      text: 'You need 3–5 stories you can tell well. Not rehearsed word-for-word — just known well enough that you don’t wander.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'The 60-second structure',
      blocks: [
        {
          kind: 'list',
          ordered: true,
          items: [
            '**Setup (10s)** — where, when, what was at stake. Minimum context.',
            '**Tension (20s)** — the complication. What went wrong or was uncertain.',
            '**Turn (20s)** — what happened. The surprise.',
            '**Point (10s)** — what it meant, or the joke. Then hand the floor back.',
          ],
        },
      ],
    },
    {
      kind: 'paragraph',
      text: '**The point should reveal a value, not a victory.** “And that’s how I learned I’d rather be uncomfortable than bored” is a hundred times better than “and that’s how I made twelve grand.” Stories where you’re competent are fine; stories where you’re *only* competent are exhausting. The best first-date stories have you being slightly ridiculous.',
    },
    {
      kind: 'paragraph',
      text: '**Cut every story in half.** Whatever length you think it is, it’s longer. Names she doesn’t know, the exact sequence of days, side details — cut all of it. If she wants more she’ll ask, and her asking is better than your explaining.',
    },
    {
      kind: 'paragraph',
      text: '**End by handing the floor back:** *“...anyway, that’s my worst travel story. You’ve got to have one.”*',
    },
    { kind: 'heading', level: 4, text: 'The three-story starter set' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Something that went hilariously wrong — shows you don’t take yourself too seriously.',
        'Something you cared enough about to sacrifice for — shows depth without a speech.',
        'Something recent and small that delighted you — shows you’re paying attention to your own life right now. Most people don’t have this one, and it’s the most attractive of the three.',
      ],
    },

    { kind: 'heading', level: 3, text: 'Talking about yourself well' },
    { kind: 'heading', level: 4, text: '“What do you do?”' },
    {
      kind: 'doDont',
      bad: '“I’m a software engineer.”',
      good: '“I build web apps — right now mostly internal tools for a logistics company, which means I get paid to argue about spreadsheets. What about you?”',
    },
    { kind: 'heading', level: 4, text: '“Tell me about yourself.”' },
    {
      kind: 'paragraph',
      text: 'The worst question in the language because it has no edges. Pick three things and be concrete.',
    },
    {
      kind: 'script',
      lines: [
        {
          text: '“Three things: I’m way too into building things nobody asked for, I’ll drive four hours for a good trail, and I’ve been trying to become a person who cooks. That’s most of it.”',
        },
      ],
      note: 'Short, specific, slightly funny, and it hands her three threads to pull.',
    },
    { kind: 'heading', level: 4, text: '“Why are you single?”' },
    {
      kind: 'paragraph',
      text: 'Don’t get defensive and don’t run down your relationship history. Light and forward-facing, then redirect:',
    },
    {
      kind: 'script',
      lines: [{ text: '“Honestly? Wasn’t looking for a while, and then I was. That’s the whole story.”' }],
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Undersell is the more common failure',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Everyone worries about bragging. The more common actual failure is **underselling** — deflecting every compliment, downplaying everything you’ve done, treating self-deprecation as the only safe register. Constant self-deprecation stops being charming around minute twenty and starts sounding like low self-regard, which is genuinely unattractive. Say the true thing about yourself plainly. “I’m proud of that one” is an acceptable sentence.',
        },
      ],
    },

    { kind: 'heading', level: 3, text: 'Failure modes and live repairs' },

    { kind: 'heading', level: 4, text: 'Dead air' },
    {
      kind: 'paragraph',
      text: 'It happens on every date. It’s only a problem if you panic. Three reliable restarts:',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**The environment.** “That guy has ordered three drinks in twenty minutes and I respect it.” Zero-effort, always available.',
        '**The callback.** “Okay, going back to what you said about your sister —” Best option: warm, and proves retention.',
        '**The reset.** “Random question for you —” then any Tier 2 question. The phrase pre-forgives the topic change and makes it playful rather than desperate.',
      ],
    },
    {
      kind: 'paragraph',
      text: 'And a fourth option: **let it sit.** A three-second silence with a comfortable smile is a display of ease. Frantically filling every gap is what actually reads as nervous.',
    },

    { kind: 'heading', level: 4, text: 'One-word answers' },
    {
      kind: 'paragraph',
      text: 'Diagnose first: nervous, or uninterested? If nervous — **stop asking questions.** More questions increase the pressure. Switch to statements and observations, which require no performance from her.',
    },
    {
      kind: 'doDont',
      bad: '“So what kind of music do you like?”',
      good: '“This song is objectively terrible and I’ve listened to it four hundred times.”',
    },
    {
      kind: 'paragraph',
      text: 'Statements give her something to react to without having to generate. Two or three usually unlocks someone.',
    },

    { kind: 'heading', level: 4, text: 'You’re talking too much' },
    {
      kind: 'paragraph',
      text: 'If you’ve gone 90 seconds with no question and no reaction from her, you’re monologuing. Repair: *“I’m talking a lot. Your turn — [specific question about her].”* Naming it lightly is charming. Don’t apologize twice.',
    },

    { kind: 'heading', level: 4, text: 'She’s monologuing' },
    {
      kind: 'paragraph',
      text: 'Sometimes nerves, sometimes a real incompatibility signal — it counts as data. To redirect, bridge from her topic rather than cutting to something unrelated: *“That’s wild — it reminds me of [short thing of yours]. Do you find that too?”*',
    },

    { kind: 'heading', level: 4, text: 'Politics or religion comes up' },
    {
      kind: 'paragraph',
      text: 'Don’t panic and don’t fake agreement — faking is worse than disagreeing, because you’re building on a lie you’ll have to maintain. Engage honestly, briefly, without trying to win:',
    },
    {
      kind: 'script',
      lines: [{ text: '“Yeah, we see that pretty differently. I’m okay with that if you are.”' }],
    },
    {
      kind: 'paragraph',
      text: 'Honest, confident, and it hands her the choice. If she wants to argue for twenty minutes, that’s useful compatibility information. If it turns into a genuine values gulf, better to know at minute 40 than month four.',
    },

    { kind: 'heading', level: 4, text: 'You said something that landed badly' },
    {
      kind: 'paragraph',
      text: 'Name it lightly, once, and move: *“That came out worse than I meant it. Let me try again.”* Three apologies for one clumsy sentence is far worse than the sentence. Grace under a small mistake is more attractive than not making the mistake.',
    },

    { kind: 'heading', level: 4, text: 'Her phone keeps buzzing' },
    {
      kind: 'paragraph',
      text: 'Ignore it once. If it continues, one light comment is fair: *“You good? Feel free if you need to take that.”* Warm is considerate; edged is controlling. Repeated phone engagement is a signal.',
    },

    { kind: 'heading', level: 4, text: 'Awkward service moments' },
    {
      kind: 'paragraph',
      text: 'Wrong order, slow check, spilled drink. **Your reaction to friction is being read closely**, and it’s one of the highest-signal moments of the night. Be gracious with staff, unbothered, slightly funny about it. Getting irritated at a server over a wrong drink can end a date on its own.',
    },

    { kind: 'heading', level: 4, text: 'Running into someone you know' },
    {
      kind: 'paragraph',
      text: 'Introduce her by name immediately, keep it to 60 seconds, don’t get absorbed. *“Sarah, this is Mike — Mike, good to see you man, we’re going to get back to it.”*',
    },

    { kind: 'heading', level: 4, text: 'You spill something on yourself' },
    { kind: 'paragraph', text: 'Laugh. Genuinely. The recovery is the whole event.' },

    { kind: 'heading', level: 3, text: 'Topics to avoid, and why' },
    {
      kind: 'list',
      ordered: false,
      items: [
        '**Ex-partners.** Any extended discussion, even neutral. It puts a third person at the table and invites a comparison you can’t win.',
        '**Money and income.** Yours or hers.',
        '**Health complaints, medications, symptoms.** Not shameful; just not first-date material.',
        '**Work grievances at length.** A funny 60-second work story is great. Ten minutes on your difficult coworker means she now knows your coworker and not you.',
        '**Diagnosing other people with therapy language.** Calling your ex a narcissist reads as a preview of how you’ll one day describe her.',
        '**Sexual history.** Nothing good is downstream of this.',
        '**Conspiracy-adjacent monologues.** Whatever the merits, minute 20 with a stranger isn’t the venue.',
        '**Anything requiring her to reassure you.** She now has a job.',
        '**Dating app horror stories, in volume.** One is bonding. Five makes you a person who’s been keeping score.',
      ],
    },
  ],
} as const satisfies GuidePart
