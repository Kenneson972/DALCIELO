import { PizzaCardSkeleton } from '@/components/menu/PizzaCardSkeleton'

export default function MenuLoading() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="animate-pulse inline-block bg-gray-200 rounded-full h-8 w-32 mb-4" />
          <div className="animate-pulse bg-gray-200 rounded-2xl h-14 w-80 mx-auto mb-6" />
          <div className="animate-pulse bg-gray-200 rounded-xl h-5 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <PizzaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
