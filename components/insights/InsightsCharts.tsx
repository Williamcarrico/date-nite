'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'

interface InsightsChartsProps {
  ratingDistribution: Record<number, number>
  categoryDistribution: Record<string, number>
  vibeDistribution: Record<string, number>
  trends: Array<{ month: string; count: number; avgCost: number }>
}

// recharts (~heavy) is deferred to its own chunk and only fetched client-side.
// ssr:false is permitted here because this is a Client Component ('use client').
const InsightsChartsClient = dynamic(() => import('./InsightsChartsClient'), {
  ssr: false,
  loading: () => (
    <Card className="border-0 shadow-md">
      <CardContent className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </CardContent>
    </Card>
  ),
})

export function InsightsCharts(props: InsightsChartsProps) {
  return <InsightsChartsClient {...props} />
}
