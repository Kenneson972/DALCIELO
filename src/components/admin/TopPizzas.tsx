'use client'

import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminCard } from '@/components/admin/adminUi'

interface TopPizzasProps {
  data: Array<{ name: string; count: number }>
}

export function TopPizzas({ data }: TopPizzasProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          adminCard,
          'flex h-full flex-col items-center justify-center p-6'
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
          <TrendingUp size={24} aria-hidden />
        </div>
        <p className="font-medium text-slate-600">Aucune vente aujourd&apos;hui</p>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <div className={cn(adminCard, 'h-full p-5 md:p-6')}>
      <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
        <TrendingUp className="h-5 w-5 text-coral" aria-hidden />
        Top pizzas du jour
      </h3>

      <div className="space-y-5">
        {data.map((pizza, index) => {
          const percentage = (pizza.count / maxCount) * 100

          return (
            <div key={pizza.name} className="group">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="truncate font-medium text-slate-800">{pizza.name}</span>
                </div>
                <span className="shrink-0 pl-2 font-bold tabular-nums text-slate-900">
                  {pizza.count}
                </span>
              </div>

              <div className="w-full overflow-hidden rounded-full bg-slate-50 pl-10">
                <div
                  className="h-2 rounded-full bg-coral transition-all duration-500 group-hover:bg-burnt-orange"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
