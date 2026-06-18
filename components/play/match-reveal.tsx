'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Heart, PartyPopper, Loader2, Calendar as CalendarIcon, Download, RefreshCw } from 'lucide-react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CATEGORIES } from '@/lib/constants/options'
import { chooseMatch, type DeckCard } from '@/lib/actions/sessions'
import { scheduleSuggestion } from '@/lib/actions/suggestions'
import { downloadICS } from '@/lib/utils/ics'
import { PromptCards } from './prompt-cards'

const categoryEmoji = (c: string) => CATEGORIES.find((x) => x.value === c)?.emoji ?? '🎯'

const CONFETTI = ['#FF6B9D', '#FFC857', '#7C5CFC', '#34D399', '#60A5FA']

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 28 }).map((_, i) => (
        <m.span
          key={i}
          className="absolute top-1/3 left-1/2 h-2 w-2 rounded-sm"
          style={{ backgroundColor: CONFETTI[i % CONFETTI.length] }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: (i % 2 ? 1 : -1) * (40 + (i * 17) % 220),
            y: 60 + ((i * 31) % 260),
            rotate: (i * 47) % 360,
            scale: 0.6,
          }}
          transition={{ duration: 1.1 + (i % 5) * 0.15, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

export function MatchReveal({
  sessionId,
  deck,
  matchIdeaIds,
  chosenIdeaId,
  partnerName,
  onPlayAgain,
}: {
  sessionId: string
  deck: DeckCard[]
  matchIdeaIds: string[]
  chosenIdeaId: string | null
  partnerName: string
  onPlayAgain: () => void
}) {
  const matches = useMemo(
    () =>
      matchIdeaIds
        .map((id) => deck.find((d) => d.ideaTemplateId === id))
        .filter((d): d is DeckCard => Boolean(d)),
    [matchIdeaIds, deck]
  )
  const hasMatch = matches.length > 0
  const reduceMotion = useReducedMotion()

  const [spinning, setSpinning] = useState(hasMatch && !chosenIdeaId)
  const [spinIndex, setSpinIndex] = useState(0)
  const [selected, setSelected] = useState<DeckCard | null>(
    chosenIdeaId ? deck.find((d) => d.ideaTemplateId === chosenIdeaId) ?? null : null
  )
  const [choosing, setChoosing] = useState(false)
  const [suggestionId, setSuggestionId] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [date, setDate] = useState<Date | undefined>()
  const [time, setTime] = useState('19:00')
  const [scheduling, setScheduling] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)

  // Slot-machine spin over the deck, settling on the best match.
  useEffect(() => {
    if (!spinning) return
    let ticks = 0
    const total = 16
    const interval = setInterval(() => {
      ticks++
      setSpinIndex((i) => (i + 1) % deck.length)
      if (ticks >= total) {
        clearInterval(interval)
        setSpinning(false)
      }
    }, 90)
    return () => clearInterval(interval)
  }, [spinning, deck.length])

  async function handleChoose(card: DeckCard) {
    setChoosing(true)
    const res = await chooseMatch(sessionId, card.ideaTemplateId)
    setChoosing(false)
    if (res.error) return toast.error(res.error)
    setSelected(card)
    setSuggestionId(res.suggestionId ?? null)
    setShowSchedule(true)
  }

  async function handleSchedule() {
    if (!suggestionId || !date || !selected) return
    setScheduling(true)
    const [h, m] = time.split(':').map(Number)
    const at = new Date(date)
    at.setHours(h, m, 0, 0)
    const res = await scheduleSuggestion(suggestionId, at, selected.durationMinutes)
    setScheduling(false)
    if (res.error) return toast.error(res.error)
    setScheduledAt(at)
    setShowSchedule(false)
    toast.success('Date scheduled!', { icon: <CalendarIcon className="w-4 h-4" /> })
  }

  const timeOptions: { value: string; label: string }[] = []
  for (let h = 10; h <= 22; h++) {
    for (const mm of ['00', '30']) {
      const hr = h > 12 ? h - 12 : h
      timeOptions.push({ value: `${h.toString().padStart(2, '0')}:${mm}`, label: `${hr}:${mm} ${h >= 12 ? 'PM' : 'AM'}` })
    }
  }

  // No mutual match
  if (!hasMatch) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12 text-center space-y-4">
          <div className="text-5xl">🤔</div>
          <h2 className="text-2xl font-bold">So close!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You and {partnerName} didn&apos;t overlap this round. Deal a fresh hand and try again — opposites attract!
          </p>
          <Button onClick={onPlayAgain} className="gradient-primary text-white rounded-xl h-12 px-8">
            <RefreshCw className="w-4 h-4 mr-2" /> Play again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Spinning
  if (spinning) {
    const card = deck[spinIndex]
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="py-16 text-center space-y-4">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Finding your match…</p>
          <m.div
            key={spinIndex}
            initial={{ opacity: 0.3, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.09 }}
            className="space-y-2"
          >
            <div className="text-5xl">{categoryEmoji(card.category)}</div>
            <div className="text-xl font-bold">{card.title}</div>
          </m.div>
        </CardContent>
      </Card>
    )
  }

  // Revealed
  const winner = selected ?? matches[0]
  return (
    <div className="space-y-4">
      <AnimatePresence>
        <m.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {!scheduledAt && !reduceMotion && <Confetti />}
          <div className="text-center space-y-1 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold">
              <PartyPopper className="w-4 h-4" />
              It&apos;s a Match!
            </div>
            <p className="text-muted-foreground text-sm">
              You and {partnerName} both picked {matches.length > 1 ? `${matches.length} ideas` : 'this'}.
            </p>
          </div>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="gradient-primary p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryEmoji(winner.category)}</span>
                <span className="font-medium capitalize">{winner.category}</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Heart className="w-3 h-3 mr-1 fill-current" /> {Math.round(winner.matchScore)}% match
              </Badge>
            </div>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">{winner.title}</h2>
              <p className="text-muted-foreground">{winner.description}</p>

              {scheduledAt ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Scheduled for</p>
                    <p className="font-semibold">{format(scheduledAt, "EEE, MMM d 'at' h:mm a")}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() =>
                      downloadICS({
                        title: `Date Night: ${winner.title}`,
                        description: winner.description,
                        startTime: scheduledAt,
                        durationMinutes: winner.durationMinutes,
                      })
                    }
                  >
                    <Download className="w-4 h-4 mr-2" /> Add to Calendar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleChoose(winner)}
                  disabled={choosing}
                  className="w-full gradient-primary text-white rounded-xl h-12"
                >
                  {choosing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
                  Plan this date
                </Button>
              )}

              <div className="pt-2 border-t border-border/50">
                <PromptCards ideaTemplateId={winner.ideaTemplateId} />
              </div>
            </CardContent>
          </Card>

          {/* Other mutual matches to choose from instead */}
          {!scheduledAt && matches.length > 1 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">You also both liked</p>
              {matches.slice(1).map((card) => (
                <button
                  key={card.candidateId}
                  onClick={() => handleChoose(card)}
                  disabled={choosing}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-primary/5 transition-colors text-left"
                >
                  <span className="text-xl">{categoryEmoji(card.category)}</span>
                  <span className="flex-1 font-medium">{card.title}</span>
                  <Badge variant="secondary" className="rounded-full">{Math.round(card.matchScore)}%</Badge>
                </button>
              ))}
            </div>
          )}
        </m.div>
      </AnimatePresence>

      <Button variant="ghost" onClick={onPlayAgain} className="w-full text-muted-foreground">
        <RefreshCw className="w-4 h-4 mr-2" /> Play another round
      </Button>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule your date</DialogTitle>
            <DialogDescription>Pick a date and time for &quot;{winner.title}&quot;</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                className="rounded-xl border"
              />
            </div>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {timeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSchedule}
              disabled={!date || scheduling}
              className="w-full gradient-primary text-white rounded-xl"
            >
              {scheduling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
