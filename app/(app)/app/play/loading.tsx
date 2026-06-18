import { Skeleton } from '@/components/ui/skeleton'

export default function PlayLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Skeleton className="h-9 w-48 mx-auto" />
        <Skeleton className="h-5 w-72 mx-auto" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
