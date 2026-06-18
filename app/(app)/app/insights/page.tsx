import { getProfileInsights, getRatingDistribution, getDateTrends, getPreferenceWeights } from '@/lib/actions/insights'
import { getSuggestionHistory } from '@/lib/actions/history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Heart, DollarSign, Calendar, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { InsightsCharts } from '@/components/insights/InsightsCharts'
import { ExportCsvButton, type ExportHistoryRow } from '@/components/insights/export-csv-button'
import { CountUp } from '@/components/motion/number-flow'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Insights' }

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [insights, ratingDist, trends, weights, historyResult] = await Promise.all([
    getProfileInsights(user.id),
    getRatingDistribution(user.id),
    getDateTrends(user.id),
    getPreferenceWeights(user.id),
    getSuggestionHistory(undefined, 1000, 0),
  ])

  const history = historyResult.data as unknown as ExportHistoryRow[]

  if (!insights || insights.totalDates === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Dates Yet</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Complete some dates to see your personalized insights and analytics!
        </p>
        <Button asChild className="gradient-primary text-white">
          <Link href="/app/randomize">
            Get Date Ideas <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Your Date Insights</h1>
        <p className="text-muted-foreground">
          Personalized analytics based on your {insights.totalDates} completed {insights.totalDates === 1 ? 'date' : 'dates'}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CountUp value={insights.totalDates} /></div>
            <p className="text-xs text-muted-foreground mt-1">
              {weights?.total_completions || 0} rated
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CountUp value={insights.avgRating} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} suffix=" ★" /></div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><CountUp value={insights.totalSpent} prefix="$" /></div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(insights.totalSpent / insights.totalDates).toFixed(0)} per date
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {insights.favoriteCategory || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Most frequently enjoyed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Insights */}
      {insights.insights.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Personalized Insights</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.insights.map((insight, i) => (
              <Card
                key={i}
                className={`border-0 shadow-md ${
                  insight.type === 'positive'
                    ? 'bg-success/5 border-l-4 border-l-success'
                    : insight.type === 'suggestion'
                    ? 'bg-primary/5 border-l-4 border-l-primary'
                    : 'bg-muted/50'
                }`}
              >
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed">{insight.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <InsightsCharts
        ratingDistribution={ratingDist}
        categoryDistribution={insights.categoryDistribution}
        vibeDistribution={insights.vibeDistribution}
        trends={trends}
      />

      {/* Preference Weights (if available) */}
      {weights && weights.total_completions > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Your Learned Preferences</CardTitle>
            <CardDescription>
              Based on {weights.total_completions} completed dates, our algorithm has learned your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Top Vibes */}
              {weights.vibe_weights && Object.keys(weights.vibe_weights).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Top Vibes</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(weights.vibe_weights)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([vibe, weight]) => (
                        <div key={vibe} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                          <span className="capitalize">{vibe}</span>
                          <span className="text-xs text-muted-foreground">
                            {weight > 1 ? '↑' : weight < 1 ? '↓' : '='} {weight.toFixed(2)}x
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Top Categories */}
              {weights.category_weights && Object.keys(weights.category_weights).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Top Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(weights.category_weights)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([category, weight]) => (
                        <div key={category} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                          <span className="capitalize">{category}</span>
                          <span className="text-xs text-muted-foreground">
                            {weight > 1 ? '↑' : weight < 1 ? '↓' : '='} {weight.toFixed(2)}x
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                Weights above 1.0x indicate preferences you enjoy more. These automatically improve your future suggestions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Button */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Export Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Download your complete date history as a CSV file
              </p>
            </div>
            <ExportCsvButton history={history} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
