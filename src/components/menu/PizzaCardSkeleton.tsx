import { Skeleton } from '@/components/ui/Skeleton'

export function PizzaCardSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-4 border-t border-gray-100">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
