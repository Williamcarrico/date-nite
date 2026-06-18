'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Gift, Loader2, Clock, DollarSign, Shirt, Download,
  Sparkles, ArrowLeft, MapPin, Zap,
} from 'lucide-react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CATEGORIES, COST_LEVELS, INTENSITY_LEVELS } from '@/lib/constants/options'
import { downloadICS } from '@/lib/utils/ics'
import { createClient } from '@/lib/supabase/client'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'
import {
  getMysteryCandidates,
  createMysteryDate,
  getMysteryView,
  revealMystery,
  cancelMystery,
  type MysteryView,
} from '@/lib/actions/mystery'
import type { ScoredCandidate } from '@/lib/actions/suggestions'

const categoryEmoji = (c?: string) => CATEGORIES.find((x) => x.value === c)?.emoji ?? '🎯'
const costLabel = (n: number) => COST_LEVELS.find((c) => c.value === n)?.label ?? '$'
const intensityMeta = (n: number) => INTENSITY_LEVELS.find((i) => i.value === n) ?? INTENSITY_LEVELS[1]

const DRESS_CODES = ['Casual', 'Dress to impress', 'Cozy & comfy', 'Active wear', 'Surprise me']

export function MysteryFlow({
  partnerName,
  initialSessionId,
  onExit,
}: {
  partnerName: string
  initialSessionId?: string | null
  onExit: () => void
}) {
  const reduceMotion = useReducedMotion()
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null)
  const [view, setView] = useState<MysteryView | null>(null)
  const [phase, setPhase] = useState<'loading' | 'planning' | 'tracking'>(
    initialSessionId ? 'loading' : 'planning'
  )

  // planning state
  const [candidates, setCandidates] = useState<ScoredCandidate[] | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [dressCode, setDressCode] = useState<string>('Surprise me')
  const [date, setDate] = useState<Date | undefined>()
  const [time, setTime] = useState('19:00')
  const [busy, setBusy] = useState(false)
  const [revealing, setRevealing] = useState(false)

  const loadView = useCallback(async (id: string) => {
    const v = await getMysteryView(id)
    setView(v)
    setPhase('tracking')
  }, [])

  useEffect(() => {
    if (!initialSessionId) return
    let active = true
    ;(async () => {
      const v = await getMysteryView(initialSessionId)
      if (!active) return
      setView(v)
      setPhase('tracking')
    })()
    return () => { active = false }
  }, [initialSessionId])

  // Load candidates for the planner.
  useEffect(() => {
    if (phase !== 'planning') return
    let active = true
    getMysteryCandidates().then((res) => {
      if (!active) return
      if (res.error) toast.error(res.error)
      setCandidates(res.candidates)
    })
    return () => { active = false }
  }, [phase])

  // While a mystery is in flight (either side, pre-reveal), poll + listen so the
  // screen updates the moment the other partner reveals. Gated on primitive
  // fields so the interval/channel are created once — not torn down every poll
  // (parseView returns a new object each tick).
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPending = phase === 'tracking' && !!sessionId && view !== null && !view.revealed
  useEffect(() => {
    if (!isPending || !sessionId) return

    const refresh = async () => {
      const v = await getMysteryView(sessionId)
      if (v) setView(v)
    }
    pollRef.current = setInterval(refresh, 3000)
    const supabase = createClient()
    const channel = supabase
      .channel(`mystery:${sessionId}`)
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
  }, [isPending, sessionId])

  const timeOptions: { value: string; label: string }[] = []
  for (let h = 10; h <= 22; h++) {
    for (const mm of ['00', '30']) {
      const hr = h > 12 ? h - 12 : h
      timeOptions.push({ value: `${h.toString().padStart(2, '0')}:${mm}`, label: `${hr}:${mm} ${h >= 12 ? 'PM' : 'AM'}` })
    }
  }

  async function handleSend() {
    if (!picked) return
    setBusy(true)
    let scheduledAt: string | null = null
    if (date) {
      const [h, m] = time.split(':').map(Number)
      const at = new Date(date)
      at.setHours(h, m, 0, 0)
      scheduledAt = at.toISOString()
    }
    const res = await createMysteryDate({ ideaTemplateId: picked, scheduledAt, dressCode })
    setBusy(false)
    if (res.error) return toast.error(res.error)
    if (res.sessionId) {
      setSessionId(res.sessionId)
      toast.success('Mystery sent! 🎁')
      await loadView(res.sessionId)
    }
  }

  async function handleReveal() {
    if (!sessionId) return
    setRevealing(true)
    const res = await revealMystery(sessionId)
    setRevealing(false)
    if (res.error) return toast.error(res.error)
    if (res.view) setView(res.view)
  }

  async function handleCancel() {
    if (!sessionId) return
    setBusy(true)
    const res = await cancelMystery(sessionId)
    setBusy(false)
    if (res.error) return toast.error(res.error)
    toast.success('Mystery cancelled')
    onExit()
  }

  // ---- LOADING ----
  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ---- TRACKING (a mystery exists) ----
  if (phase === 'tracking' && view) {
    // Revealed result (either partner)
    if (view.revealed) {
      const scheduled = view.scheduledAt ? new Date(view.scheduledAt) : null
      return (
        <div className="space-y-4">
          <m.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold">
                <Gift className="w-4 h-4" /> Mystery revealed!
              </span>
            </div>
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="gradient-primary p-4 text-white flex items-center gap-2">
                <span className="text-2xl">{categoryEmoji(view.category)}</span>
                <span className="font-medium capitalize">{view.category}</span>
              </div>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-2xl font-bold">{view.title}</h2>
                <p className="text-muted-foreground">{view.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <DollarSign className="w-5 h-5 mx-auto text-success mb-1" />
                    <p className="font-semibold">{costLabel(view.costLevel)}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <Clock className="w-5 h-5 mx-auto text-secondary mb-1" />
                    <p className="font-semibold">{Math.round(view.durationMinutes / 60)}h</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted">
                    <Zap className="w-5 h-5 mx-auto text-primary mb-1" />
                    <p className="font-semibold">{intensityMeta(view.intensityLevel).emoji}</p>
                  </div>
                </div>
                {view.dressCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shirt className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Dress code:</span>
                    <span className="font-medium">{view.dressCode}</span>
                  </div>
                )}
                {scheduled && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">Scheduled for</p>
                      <p className="font-semibold">{format(scheduled, "EEE, MMM d 'at' h:mm a")}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() =>
                        downloadICS({
                          title: `Date Night: ${view.title}`,
                          description: view.description ?? '',
                          startTime: scheduled,
                          durationMinutes: view.durationMinutes,
                        })
                      }
                    >
                      <Download className="w-4 h-4 mr-2" /> Add to Calendar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </m.div>
          <Button variant="ghost" onClick={onExit} className="w-full text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Play
          </Button>
        </div>
      )
    }

    // Planner waiting for partner to open
    if (view.isPlanner) {
      return (
        <Card className="border-0 shadow-md">
          <CardContent className="py-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Mystery sent to {partnerName}</h2>
              <p className="text-muted-foreground mt-1">
                You picked <span className="font-medium text-foreground">{view.title}</span>. They&apos;ll see only
                a teaser until they open it.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Button variant="outline" onClick={handleReveal} disabled={revealing} className="rounded-xl">
                {revealing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Reveal it now
              </Button>
              <Button variant="ghost" onClick={handleCancel} disabled={busy} className="rounded-xl text-muted-foreground">
                Cancel mystery
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Partner teaser (pre-reveal)
    const scheduled = view.scheduledAt ? new Date(view.scheduledAt) : null
    return (
      <div className="space-y-4">
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="gradient-primary p-6 text-center text-white">
            <m.div
              animate={reduceMotion ? undefined : { rotate: [0, -8, 8, -8, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.8 }}
              className="text-5xl"
            >
              🎁
            </m.div>
            <h2 className="text-xl font-bold mt-3">{partnerName} planned a mystery date!</h2>
            <p className="opacity-90 text-sm mt-1">Here&apos;s a peek — open it to see the full surprise.</p>
          </div>
          <CardContent className="pt-6 space-y-4">
            <StaggerGroup className="grid grid-cols-3 gap-3" stagger={0.1}>
              <StaggerItem variant="scale" className="text-center p-3 rounded-xl bg-muted">
                <DollarSign className="w-5 h-5 mx-auto text-success mb-1" />
                <p className="font-semibold">{costLabel(view.costLevel)}</p>
                <p className="text-xs text-muted-foreground">Budget</p>
              </StaggerItem>
              <StaggerItem variant="scale" className="text-center p-3 rounded-xl bg-muted">
                <Clock className="w-5 h-5 mx-auto text-secondary mb-1" />
                <p className="font-semibold">{Math.round(view.durationMinutes / 60)}h</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </StaggerItem>
              <StaggerItem variant="scale" className="text-center p-3 rounded-xl bg-muted">
                <Zap className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="font-semibold">{intensityMeta(view.intensityLevel).emoji}</p>
                <p className="text-xs text-muted-foreground">{intensityMeta(view.intensityLevel).label}</p>
              </StaggerItem>
            </StaggerGroup>
            <div className="flex flex-wrap gap-3 text-sm">
              {view.dressCode && (
                <span className="inline-flex items-center gap-1.5">
                  <Shirt className="w-4 h-4 text-muted-foreground" /> {view.dressCode}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {view.requiresReservation ? 'Reservation planned' : 'No reservation needed'}
              </span>
            </div>
            {scheduled && (
              <p className="text-sm">
                <span className="text-muted-foreground">When: </span>
                <span className="font-medium">{format(scheduled, "EEE, MMM d 'at' h:mm a")}</span>
              </p>
            )}
            <Button
              onClick={handleReveal}
              disabled={revealing}
              className="w-full gradient-primary text-white rounded-xl h-12 text-lg shadow-playful"
            >
              {revealing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Gift className="w-5 h-5 mr-2" />}
              Open the mystery
            </Button>
          </CardContent>
        </Card>
        <Button variant="ghost" onClick={onExit} className="w-full text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    )
  }

  // ---- PLANNING (planner picks a secret idea) ----
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Plan a mystery date for {partnerName}
        </CardTitle>
        <CardDescription>Pick one idea. {partnerName} sees only a teaser until they open it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {candidates === null ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No fresh ideas available right now. Try again later.
          </p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {candidates.map((c) => {
                const on = picked === c.idea_id
                return (
                  <button
                    key={c.idea_id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked(c.idea_id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                      on ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <span className="text-xl">{categoryEmoji(c.idea_data.category)}</span>
                    <span className="flex-1">
                      <span className="font-medium block">{c.idea_data.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {c.idea_data.category} · {costLabel(c.idea_data.cost_level)}
                      </span>
                    </span>
                    {on && <Badge className="rounded-full gradient-primary text-white border-0">Picked</Badge>}
                  </button>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {picked && (
          <div className="space-y-4 pt-2 border-t border-border/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dress code hint</label>
              <Select value={dressCode} onValueChange={setDressCode}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DRESS_CODES.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">When (optional)</label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                  className="rounded-xl border"
                />
              </div>
              {date && (
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={busy}
              className="w-full gradient-primary text-white rounded-xl h-12 shadow-playful"
            >
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Gift className="w-4 h-4 mr-2" />}
              Send the mystery to {partnerName}
            </Button>
          </div>
        )}

        <Button variant="ghost" onClick={onExit} className="w-full text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Play
        </Button>
      </CardContent>
    </Card>
  )
}
