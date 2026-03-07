'use client'

import type { ReactNode } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { Order } from '@/types/order'

interface RevenueChartProps {
  orders: Order[]
}

const SLOT_MIN = 15
const PAID_STATUSES = ['paid', 'in_preparation', 'ready', 'in_delivery', 'completed']

export function RevenueChart({ orders }: RevenueChartProps) {
  const now = new Date()
  const todayStr = now.toDateString()

  const todayOrders = orders.filter(
    (o) =>
      new Date(o.created_at).toDateString() === todayStr &&
      PAID_STATUSES.includes(o.status)
  )

  // Plage dynamique : de 18h00 au plus tard parmi [maintenant, 22h00]
  // Si des commandes existent avant 18h, on recule le début
  const base = (h: number, m = 0) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0).getTime()

  const defaultStart = base(18)
  const defaultEnd = base(22)

  const orderTimes = todayOrders.map((o) => new Date(o.created_at).getTime())
  const rangeStart = orderTimes.length > 0 ? Math.min(defaultStart, ...orderTimes) : defaultStart
  const rangeEnd = orderTimes.length > 0 ? Math.max(defaultEnd, now.getTime()) : defaultEnd

  // Arrondi aux slots
  const startMs = Math.floor(rangeStart / (SLOT_MIN * 60_000)) * (SLOT_MIN * 60_000)
  const endMs = Math.ceil(rangeEnd / (SLOT_MIN * 60_000)) * (SLOT_MIN * 60_000)
  const numSlots = Math.ceil((endMs - startMs) / (SLOT_MIN * 60_000))

  const slotData = Array.from({ length: numSlots }, (_, i) => {
    const slotStart = startMs + i * SLOT_MIN * 60_000
    const slotEnd = slotStart + SLOT_MIN * 60_000
    const d = new Date(slotStart)
    const hh = d.getHours().toString().padStart(2, '0')
    const mm = d.getMinutes().toString().padStart(2, '0')

    const slotOrders = todayOrders.filter((o) => {
      const t = new Date(o.created_at).getTime()
      return t >= slotStart && t < slotEnd
    })

    return {
      label: `${hh}:${mm}`,
      revenue: parseFloat(slotOrders.reduce((s, o) => s + o.total, 0).toFixed(2)),
      orders: slotOrders.length,
    }
  })

  const totalRevenue = todayOrders.reduce((s, o) => s + o.total, 0)
  const maxRevenue = Math.max(...slotData.map((d) => d.revenue), 1)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-slate-900">
          Revenus par créneau (15 min)
        </h3>
        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-lg">
          {todayOrders.length} cmd{todayOrders.length > 1 ? 's' : ''}
        </span>
      </div>

      {todayOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm font-medium">Aucune commande payée aujourd'hui</p>
          <p className="text-xs text-slate-300 mt-1">Les commandes apparaîtront ici en temps réel</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={slotData} barSize={Math.max(4, Math.min(20, 220 / numSlots))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              style={{ fontSize: '11px', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dy={10}
              // Affiche uniquement les labels à l'heure ronde (HH:00)
              tickFormatter={(val: string) => val.endsWith(':00') ? val : ''}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickFormatter={(v) => `${v}€`}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '10px 14px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              cursor={{ fill: '#f8fafc' }}
              formatter={(value: unknown, name?: string): [ReactNode, string] => {
                if (name === 'revenue')
                  return [
                    <span className="font-bold text-orange-600">{String(value)}€</span>,
                    'Revenus',
                  ]
                return [String(value), name ?? '']
              }}
              labelFormatter={(label) => (
                <span className="text-xs font-bold text-slate-500">{label}</span>
              )}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {slotData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.revenue >= maxRevenue * 0.8 ? '#ea580c' : '#f97316'}
                  fillOpacity={entry.revenue > 0 ? 1 : 0.15}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">Total aujourd'hui</span>
        <span className="text-xl font-bold text-slate-900 tracking-tight">
          {totalRevenue.toFixed(2)}€
        </span>
      </div>
    </div>
  )
}
