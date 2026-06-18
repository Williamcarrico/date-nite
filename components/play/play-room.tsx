'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Hourglass, Gift, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { SETTING_TYPES, INTENSITY_LEVELS } from '@/lib/constants/options'
import {
  startRound,
  getActiveSession,
  getDeck,
  getSessionState,
  submitPick,
  type DeckCard,
  type SessionState,
} from '@/lib/actions/sessions'
import { getActiveMystery } from '@/lib/actions/mystery'
import { PickDeck } from './pick-deck'
import { MatchReveal } from './match-reveal'
import { MysteryFlow } from './mystery-flow'

type Phase = 'loading' | 'lobby' | 'picking' | 'waiting' | 'revealed' | 'mystery'

export function PlayRoom({ partnerName }: { partnerName: string | null }) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [deck, setDeck] = useState<DeckCard[]>([])
  const [state, setState] = useState<SessionState | null>(null)
  const [settings, setSettings] = useState<string[]>([])
  const [intensities, setIntensities] = useState<number[]>([])
  const [starting, setStarting] = useState(false)
  const [mysterySessionId, setMysterySessionId] = useState<string | null>(null)
  const partner = partnerName ?? 'your partner'

  const loadSession = useCallback(async (id: string) => {
    const [d, s] = await Promise.all([getDeck(id), getSessionState(id)])
    setDeck(d)
    setState(s)
    setSessionId(id)
    if (s?.status === 'revealed' || s?.status === 'resolved') setPhase('revealed')
    else if (s?.myDone) setPhase('waiting')
    else setPhase('picking')
  }, [])

  // Resume an in-flight round on mount (mystery takes priority, then double-pick).
  useEffect(() => {
    let active = true
    ;(async () => {
      const mystery = await getActiveMystery()
      if (!active) return
      if (mystery?.sessionId) {
        setMysterySessionId(mystery.sessionId)
        setPhase('mystery')
        return
      }
      const res = await getActiveSession()
      if (!active) return
      if (res?.sessionId) loadSession(res.sessionId)
      else setPhase('lobby')
    })()
    return () => { active = false }
  }, [loadSession])

  // While waiting, poll state and listen for the reveal in realtime.
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (phase !== 'waiting' || !sessionId) return

    const refresh = async () => {
      const s = await getSessionState(sessionId)
      if (s) {
        setState(s)
        if (s.status === 'revealed' || s.status === 'resolved') setPhase('revealed')
      }
    }

    pollRef.current = setInterval(refresh, 2500)
    const supabase = createClient()
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'date_sessions', filter: `id=eq.${sessionId}` },
        () => refresh()
      )
      .subscribe()

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      supabase.removeChannel(channel)
    }
  }, [phase, sessionId])

  async function handleStart() {
    setStarting(true)
    const res = await startRound({
      settingTypes: settings.length ? settings : undefined,
      intensityLevels: intensities.length ? intensities : undefined,
    })
    setStarting(false)
    if (res.error) return toast.error(res.error)
    if (res.sessionId) await loadSession(res.sessionId)
  }

  async function handlePick(candidateId: string, liked: boolean) {
    if (!sessionId) return
    const res = await submitPick(sessionId, candidateId, liked)
    if (res.error) toast.error(res.error)
    else if (res.state) setState(res.state)
  }

  function handlePlayAgain() {
    setSessionId(null)
    setDeck([])
    setState(null)
    setPhase('lobby')
  }

  function handleExitMystery() {
    setMysterySessionId(null)
    setPhase('lobby')
  }

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (phase === 'mystery') {
    return <MysteryFlow partnerName={partner} initialSessionId={mysterySessionId} onExit={handleExitMystery} />
  }

  if (phase === 'revealed' && sessionId && state) {
    return (
      <MatchReveal
        sessionId={sessionId}
        deck={deck}
        matchIdeaIds={state.matchIdeaIds}
        chosenIdeaId={state.chosenIdeaId}
        partnerName={partner}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  if (phase === 'picking' && deck.length > 0) {
    return <PickDeck deck={deck} onPick={handlePick} onComplete={() => setPhase('waiting')} />
  }

  if (phase === 'waiting') {
    const done = state?.partnerDone
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Hourglass className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {done ? 'Revealing your match…' : `Waiting for ${partner}`}
            </h2>
            <p className="text-muted-foreground mt-1">
              {done
                ? 'Both of you are done!'
                : `You've made your picks. ${partner} has chosen ${state?.partnerPicks ?? 0} of ${state?.candidateCount ?? 0}.`}
            </p>
          </div>
          {done && <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />}
        </CardContent>
      </Card>
    )
  }

  // Lobby
  return (
    <div className="space-y-4">
      {/* Mode chooser: Mystery Date */}
      <button
        type="button"
        onClick={() => { setMysterySessionId(null); setPhase('mystery') }}
        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border bg-card text-left hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-playful shrink-0">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Plan a Mystery Date</p>
          <p className="text-sm text-muted-foreground">Secretly pick a date — {partner} only sees a teaser until they open it.</p>
        </div>
      </button>

      <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Blind Double-Pick with {partner}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Setting (optional)</p>
          <div className="flex flex-wrap gap-2">
            {SETTING_TYPES.map((s) => {
              const on = settings.includes(s.value)
              return (
                <Button
                  key={s.value}
                  type="button"
                  size="sm"
                  variant={on ? 'default' : 'outline'}
                  aria-pressed={on}
                  className="rounded-full"
                  onClick={() =>
                    setSettings((p) => (on ? p.filter((x) => x !== s.value) : [...p, s.value]))
                  }
                >
                  {s.emoji} {s.label}
                </Button>
              )
            })}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Intensity (optional)</p>
          <div className="flex flex-wrap gap-2">
            {INTENSITY_LEVELS.map((l) => {
              const on = intensities.includes(l.value)
              return (
                <Button
                  key={l.value}
                  type="button"
                  size="sm"
                  variant={on ? 'default' : 'outline'}
                  aria-pressed={on}
                  className="rounded-full"
                  onClick={() =>
                    setIntensities((p) => (on ? p.filter((x) => x !== l.value) : [...p, l.value]))
                  }
                >
                  {l.emoji} {l.label}
                </Button>
              )
            })}
          </div>
        </div>

        {(settings.length > 0 || intensities.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => { setSettings([]); setIntensities([]) }}
          >
            Clear filters
          </Button>
        )}

        <Button
          onClick={handleStart}
          disabled={starting}
          className="w-full gradient-primary text-white rounded-xl h-14 text-lg shadow-playful"
        >
          {starting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
          Deal the cards
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          You&apos;ll each pick privately from the same 5 ideas. Matches reveal when you&apos;re both done.
        </p>
      </CardContent>
      </Card>
    </div>
  )
}
