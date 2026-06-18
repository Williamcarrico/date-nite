'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Heart, X, Clock, DollarSign } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { CATEGORIES, COST_LEVELS } from '@/lib/constants/options'
import type { DeckCard } from '@/lib/actions/sessions'

const categoryEmoji = (c: string) => CATEGORIES.find((x) => x.value === c)?.emoji ?? '🎯'
const costLabel = (n: number) => COST_LEVELS.find((c) => c.value === n)?.label ?? '$'

export function PickDeck({
  deck,
  onPick,
  onComplete,
}: {
  deck: DeckCard[]
  onPick: (candidateId: string, liked: boolean) => Promise<void>
  onComplete: () => void
}) {
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const card = deck[index]

  async function choose(liked: boolean) {
    if (busy || !card) return
    setBusy(true)
    await onPick(card.candidateId, liked)
    setBusy(false)
    if (index + 1 >= deck.length) {
      onComplete()
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (!card) return null

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Pick the ones you&apos;d love — your partner can&apos;t see your choices</span>
          <span>{index + 1} / {deck.length}</span>
        </div>
        <Progress value={((index) / deck.length) * 100} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <m.div
          key={card.candidateId}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="gradient-primary p-4 text-white flex items-center gap-2">
              <span className="text-2xl">{categoryEmoji(card.category)}</span>
              <span className="font-medium capitalize">{card.category}</span>
            </div>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-2xl font-bold">{card.title}</h3>
              <p className="text-muted-foreground">{card.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {costLabel(card.costLevel)}
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.round(card.durationMinutes / 60)}h
                </Badge>
                {card.vibeTags.slice(0, 3).map((v) => (
                  <Badge key={v} variant="secondary" className="rounded-full capitalize">{v}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </m.div>
      </AnimatePresence>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => choose(false)}
          disabled={busy}
          className="flex-1 rounded-xl h-14 text-base"
        >
          <X className="w-5 h-5 mr-2" /> Pass
        </Button>
        <Button
          onClick={() => choose(true)}
          disabled={busy}
          className="flex-1 rounded-xl h-14 text-base gradient-primary text-white shadow-playful"
        >
          <Heart className="w-5 h-5 mr-2 fill-current" /> Love it
        </Button>
      </div>
    </div>
  )
}
