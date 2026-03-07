'use client'

import { TrendingUp } from 'lucide-react'

interface TopPizzasProps {
  data: Array<{ name: string; count: number }>
}

export function TopPizzas({ data }: TopPizzasProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 h-full flex flex-col justify-center items-center">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
          <TrendingUp size={24} />
        </div>
        <p className="text-slate-500 font-medium">Aucune vente aujourd'hui</p>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 h-full">
      <h3 className="text-base font-semibold text-slate-900 mb-6 flex items-center gap-2">
        Top Pizzas du jour
      </h3>

      <div className="space-y-5">
        {data.map((pizza, index) => {
          const percentage = (pizza.count / maxCount) * 100
          const medals = ['🥇', '🥈', '🥉']

          return (
            <div key={pizza.name} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center font-medium text-slate-400">
                    {medals[index] || <span className="text-sm">#{index + 1}</span>}
                  </span>
                  <span className="font-medium text-slate-700">{pizza.name}</span>
                </div>
                <span className="font-bold text-slate-900">{pizza.count}</span>
              </div>

              <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden pl-9">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500 group-hover:bg-orange-600"
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
