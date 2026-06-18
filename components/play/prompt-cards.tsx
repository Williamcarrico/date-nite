'use client'

import { useEffect, useState } from 'react'
import { MessageCircleHeart, Flame, Loader2 } from 'lucide-react'
import { getPromptCards, type PromptCard } from '@/lib/actions/prompts'

export function PromptCards({ ideaTemplateId }: { ideaTemplateId: string }) {
  const [cards, setCards] = useState<PromptCard[] | null>(null)

  useEffect(() => {
    let active = true
    getPromptCards(ideaTemplateId, 3).then((c) => {
      if (active) setCards(c)
    })
    return () => { active = false }
  }, [ideaTemplateId])

  if (cards === null) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (cards.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Bring these on your date</p>
      <div className="space-y-2">
        {cards.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
          >
            <div className={`shrink-0 mt-0.5 ${c.kind === 'dare' ? 'text-secondary' : 'text-primary'}`}>
              {c.kind === 'dare' ? <Flame className="w-4 h-4" /> : <MessageCircleHeart className="w-4 h-4" />}
            </div>
            <p className="text-sm">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
