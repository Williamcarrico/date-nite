'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Clock, DollarSign, Calendar } from 'lucide-react'
import { m } from 'motion/react'
import { StaggerGroup } from '@/components/motion/reveal'
import { fadeUp, EASE_OUT } from '@/components/motion/variants'

const colorMap = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  accent: { bg: 'bg-accent/10', text: 'text-accent' },
} as const

const features = [
  { icon: Sparkles, title: 'Personalized Ideas', description: 'Get date suggestions tailored to your preferences, budget, and vibe.', color: 'primary' as const },
  { icon: Clock, title: '90-Day No Repeats', description: "Every idea is fresh. We won't suggest the same thing for 90 days.", color: 'secondary' as const },
  { icon: DollarSign, title: 'Budget Aware', description: 'Set your budget range and only see ideas that fit your spending.', color: 'success' as const },
  { icon: Calendar, title: 'Easy Scheduling', description: 'Schedule dates and add them to your calendar with one click.', color: 'accent' as const },
]

export function FeatureCards() {
  return (
    <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature) => (
        <m.div
          key={feature.title}
          variants={fadeUp}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="group"
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow h-full">
            <CardContent className="pt-6">
              <div
                className={`w-12 h-12 rounded-2xl ${colorMap[feature.color].bg} flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110`}
              >
                <feature.icon className={`w-6 h-6 ${colorMap[feature.color].text}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        </m.div>
      ))}
    </StaggerGroup>
  )
}
