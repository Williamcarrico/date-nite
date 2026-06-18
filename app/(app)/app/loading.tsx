import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-12 w-36 rounded-xl" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
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

      {/* Main content grid skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
