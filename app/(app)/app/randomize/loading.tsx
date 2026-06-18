import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function RandomizeLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <Skeleton className="h-9 w-48 mx-auto" />
        <Skeleton className="h-4 w-56 mx-auto" />
      </div>

      {/* Filter card skeleton */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
      </Card>

      {/* Generate card skeleton */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64 mx-auto" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <Skeleton className="h-14 w-52 rounded-xl mx-auto" />
        </CardContent>
      </Card>
    </div>
  )
}
