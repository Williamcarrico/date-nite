import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function LoginLoading() {
  return (
    <Card className="shadow-playful-lg border-0">
      <CardHeader className="text-center pb-2">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-7 w-44 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </CardContent>
    </Card>
  )
}
