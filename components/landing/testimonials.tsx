'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star } from 'lucide-react'
import { m } from 'motion/react'
import { StaggerGroup } from '@/components/motion/reveal'
import { fadeUp, EASE_OUT } from '@/components/motion/variants'

const testimonials = [
  { quote: "We've used this for months and haven't repeated a single date. Our relationship has never been more exciting!", author: 'Sarah & Mike', rating: 5, gradient: 'gradient-primary' },
  { quote: 'The budget feature is amazing. We always stay on track while still having incredible experiences.', author: 'Jordan & Taylor', rating: 5, gradient: 'gradient-secondary' },
  { quote: 'So much better than arguing about what to do. Now we just spin and go!', author: 'Alex & Chris', rating: 5, gradient: 'gradient-success' },
]

function initials(author: string) {
  return author
    .split(/\s*&\s*/)
    .map((n) => n.trim()[0])
    .join('')
    .toUpperCase()
}

export function Testimonials() {
  return (
    <StaggerGroup className="grid sm:grid-cols-3 gap-6">
      {testimonials.map((t) => (
        <m.div
          key={t.author}
          variants={fadeUp}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow h-full">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`${t.gradient} text-white text-xs font-semibold`}>
                    {initials(t.author)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">{t.author}</p>
              </div>
            </CardContent>
          </Card>
        </m.div>
      ))}
    </StaggerGroup>
  )
}
