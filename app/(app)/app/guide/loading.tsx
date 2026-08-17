import { Skeleton } from '@/components/ui/skeleton'

export default function GuideLoading() {
  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-12">
      <div className="max-w-[68ch] space-y-8">
        <div className="space-y-4 pb-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-2/3" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full last:w-4/5" />
          ))}
        </div>
      </div>

      <div className="hidden space-y-2 xl:block">
        <Skeleton className="h-3 w-20" />
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  )
}
