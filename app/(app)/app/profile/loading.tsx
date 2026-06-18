import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}
