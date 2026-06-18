'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts'

interface InsightsChartsProps {
  ratingDistribution: Record<number, number>
  categoryDistribution: Record<string, number>
  vibeDistribution: Record<string, number>
  trends: Array<{ month: string; count: number; avgCost: number }>
}

const COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--accent)',
  'var(--success)',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
]

export default function InsightsChartsClient({
  ratingDistribution,
  categoryDistribution,
  vibeDistribution,
  trends,
}: InsightsChartsProps) {
  // Transform rating distribution for chart
  const ratingData = Object.entries(ratingDistribution)
    .map(([rating, count]) => ({
      rating: `${rating}★`,
      count,
    }))
    .filter((item) => item.count > 0)

  // Transform category distribution for pie chart
  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  // Transform vibe distribution for chart (top 8)
  const vibeData = Object.entries(vibeDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: value,
    }))

  // Transform trends data for area chart
  const trendsData = trends.map((t) => ({
    month: new Date(t.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    dates: t.count,
    cost: Math.round(t.avgCost),
  }))

  return (
    <div className="space-y-6">
      {/* Rating Distribution */}
      {ratingData.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>How you&apos;ve rated your dates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="rating" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Category and Vibe Distribution Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>What types of dates you&apos;ve done</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Vibe Distribution */}
        {vibeData.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Top Vibes</CardTitle>
              <CardDescription>Most common date atmospheres</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vibeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" />
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trends Over Time */}
      {trendsData.length > 1 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Date Activity Over Time</CardTitle>
            <CardDescription>Monthly date count and average cost</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendsData}>
                <defs>
                  <linearGradient id="colorDates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis yAxisId="left" stroke="var(--muted-foreground)" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="dates"
                  stroke="var(--primary)"
                  fill="url(#colorDates)"
                  name="Dates"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="cost"
                  stroke="var(--success)"
                  fill="url(#colorCost)"
                  name="Avg Cost ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
