import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, Sparkles, Calendar, Star, Clock, ArrowRight, TrendingUp } from 'lucide-react'
import { CountUp } from '@/components/motion/number-flow'
import { AddToCalendarButton } from '@/components/calendar/add-to-calendar-button'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export const cacheComponents = true

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileStats {
  total_suggestions: number
  completed_dates: number
  average_rating: number | null
  active_exclusions: number
  favorites_count: number
}

interface IdeaTemplate {
  title: string
  description: string
  category: string
  duration_minutes: number
}

interface UpcomingDate {
  id: string
  scheduled_at: string | null
  idea_templates: IdeaTemplate | null
}

interface RecentSuggestion {
  id: string
  status: string
  created_at: string
  idea_templates: {
    title: string
    category: string
  } | null
}

// ---------------------------------------------------------------------------
// Async sub-components (each fetches its own data, runs in a Suspense shell)
// ---------------------------------------------------------------------------

async function WelcomeHeader({ userId }: Readonly<{ userId: string }>) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()

  const displayName =
    (profile as { display_name: string | null } | null)?.display_name ||
    'there'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold">
          Hey, {displayName}! <span className="inline-block animate-float">👋</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to plan your next amazing date?
        </p>
      </div>
      <Link href="/app/randomize">
        <Button className="gradient-primary text-white shadow-playful hover:shadow-playful-lg transition-shadow rounded-xl h-12 px-6">
          <Sparkles className="w-5 h-5 mr-2" />
          Get Date Ideas
        </Button>
      </Link>
    </div>
  )
}

function WelcomeHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="h-12 w-36 rounded-xl" />
    </div>
  )
}

async function StatsGrid({ userId }: Readonly<{ userId: string }>) {
  const supabase = await createClient()
  const { data } = await supabase
    .rpc('get_profile_stats', { p_profile_id: userId } as never)
    .single()

  const stats = data as ProfileStats | null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold"><CountUp value={stats?.total_suggestions || 0} /></p>
              <p className="text-xs text-muted-foreground">Total Ideas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold"><CountUp value={stats?.completed_dates || 0} /></p>
              <p className="text-xs text-muted-foreground">Dates Done</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats?.average_rating != null
                  ? <CountUp value={stats.average_rating} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
                  : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold"><CountUp value={stats?.favorites_count || 0} /></p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {(['ideas', 'dates', 'rating', 'favorites'] as const).map((key) => (
        <Card key={key} className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function statusClass(status: string): string {
  if (status === 'completed') return 'bg-success/10 text-success'
  if (status === 'scheduled') return 'bg-primary/10 text-primary'
  if (status === 'skipped') return 'bg-muted-foreground/10 text-muted-foreground'
  return 'bg-accent/10 text-accent'
}

async function MainContent({ userId }: Readonly<{ userId: string }>) {
  const supabase = await createClient()

  const [upcomingResult, recentResult] = await Promise.all([
    supabase
      .from('suggestions')
      .select('*, idea_templates (title, description, category, duration_minutes)')
      .eq('profile_id', userId)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single(),
    supabase
      .from('suggestions')
      .select('*, idea_templates (title, category)')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const upcomingDate = upcomingResult.data as unknown as UpcomingDate | null
  const recentSuggestions = (recentResult.data as unknown as RecentSuggestion[]) || []

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Upcoming Date */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDate ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-muted">
                <p className="font-semibold">{upcomingDate.idea_templates?.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {upcomingDate.scheduled_at
                    ? new Date(upcomingDate.scheduled_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Time TBD'}
                </p>
              </div>
              {upcomingDate.scheduled_at && upcomingDate.idea_templates && (
                <AddToCalendarButton
                  title={upcomingDate.idea_templates.title}
                  description={upcomingDate.idea_templates.description}
                  scheduledAt={upcomingDate.scheduled_at}
                  durationMinutes={upcomingDate.idea_templates.duration_minutes}
                  size="default"
                  className="w-full rounded-xl"
                />
              )}
              <Link href="/app/history">
                <Button variant="outline" className="w-full rounded-xl">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3 animate-float" />
              <p className="text-muted-foreground mb-4">No upcoming dates scheduled</p>
              <Link href="/app/randomize">
                <Button variant="outline" className="rounded-xl">
                  Plan a Date
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSuggestions.length > 0 ? (
            <div className="space-y-3">
              {recentSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted"
                >
                  <div>
                    <p className="font-medium text-sm">{suggestion.idea_templates?.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {suggestion.idea_templates?.category}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${statusClass(suggestion.status)}`}
                  >
                    {suggestion.status}
                  </span>
                </div>
              ))}
              <Link href="/app/history">
                <Button variant="ghost" className="w-full rounded-xl">
                  View All History
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3 animate-float" />
              <p className="text-muted-foreground mb-4">No activity yet</p>
              <Link href="/app/randomize">
                <Button variant="outline" className="rounded-xl">
                  Get Your First Idea
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MainContentSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {(['upcoming', 'recent'] as const).map((panel) => (
        <Card key={panel} className="border-0 shadow-md">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              {(['a', 'b', 'c'] as const).map((row) => (
                <div key={row} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Suspense fallback={<WelcomeHeaderSkeleton />}>
        <WelcomeHeader userId={user.id} />
      </Suspense>

      {/* Stats Grid */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid userId={user.id} />
      </Suspense>

      {/* Upcoming Date + Recent Activity */}
      <Suspense fallback={<MainContentSkeleton />}>
        <MainContent userId={user.id} />
      </Suspense>

      {/* Quick Tips — static, no data fetch */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-secondary flex items-center justify-center shadow-playful shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Pro Tip: Set Your Preferences</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Update your profile with your budget, location, and vibe preferences to get
                personalized date suggestions!
              </p>
            </div>
            <Link href="/app/profile">
              <Button variant="secondary" className="rounded-xl shrink-0">
                Update Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
