import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      {/* Header + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-80 rounded-xl" />
      </div>

      {/* History items */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
