import { Card, CardContent } from '@/components/ui/card'
import { Flame, Heart, Compass } from 'lucide-react'
import { getCoupleStats } from '@/lib/actions/couples'
import { CountUp } from '@/components/motion/number-flow'
import { StaggerGroup, StaggerItem } from '@/components/motion/reveal'

export async function CoupleMilestones() {
  const stats = await getCoupleStats()
  if (!stats || stats.totalDates === 0) return null

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-primary">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-xl font-bold"><CountUp value={stats.totalDates} /></span>
            </div>
            <p className="text-xs text-muted-foreground">Dates together</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-secondary">
              <Flame className="w-4 h-4" />
              <span className="text-xl font-bold"><CountUp value={stats.currentStreakWeeks} /></span>
            </div>
            <p className="text-xs text-muted-foreground">Week streak</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-success">
              <Compass className="w-4 h-4" />
              <span className="text-xl font-bold"><CountUp value={stats.settingsExplored} /></span>
            </div>
            <p className="text-xs text-muted-foreground">Settings explored</p>
          </div>
        </div>

        <StaggerGroup className="flex flex-wrap gap-2 justify-center" stagger={0.06}>
          {stats.badges.map((b) => (
            <StaggerItem key={b.id} variant="scale">
              <span
                title={b.label}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-opacity ${
                  b.earned
                    ? 'bg-primary/10 border-primary/30 text-foreground'
                    : 'bg-muted border-border text-muted-foreground opacity-50'
                }`}
              >
                <span>{b.emoji}</span>
                {b.label}
              </span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </CardContent>
    </Card>
  )
}
