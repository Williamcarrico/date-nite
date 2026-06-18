import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function InsightsLoading() {
  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart placeholders */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-52 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  )
}
