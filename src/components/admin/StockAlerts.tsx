'use client'

import { AlertTriangle, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Stock } from '@/lib/stocksStore'

export interface StockAlert {
  level: 'critical' | 'warning'
  item: string
  message: string
  quantity: number
  threshold: number
}

function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
}

function computeAlerts(stocks: Stock[]): StockAlert[] {
  const alerts: StockAlert[] = []
  stocks.forEach((stock) => {
    if (stock.quantity <= stock.min_threshold) {
      alerts.push({
        level: 'critical',
        item: stock.name,
        message: `Stock critique : ${stock.quantity} ${stock.unit} restant(s)`,
        quantity: stock.quantity,
        threshold: stock.min_threshold,
      })
    } else if (stock.quantity <= stock.min_threshold * 2) {
      alerts.push({
        level: 'warning',
        item: stock.name,
        message: `Stock faible : ${stock.quantity} ${stock.unit}`,
        quantity: stock.quantity,
        threshold: stock.min_threshold,
      })
    }
  })
  return alerts.sort((a, b) => {
    if (a.level === 'critical' && b.level === 'warning') return -1
    if (a.level === 'warning' && b.level === 'critical') return 1
    return 0
  })
}

export function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])

  useEffect(() => {
    const load = async () => {
      const pin = getAdminPin()
      try {
        const res = await fetch('/api/admin/stocks', { headers: { 'x-admin-pin': pin } })
        const data = await res.json().catch(() => ({}))
        if (res.ok && Array.isArray(data.stocks)) {
          setAlerts(computeAlerts(data.stocks))
          return
        }
      } catch (_) {}
      setAlerts([])
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
            ✅
          </div>
          <div>
            <p className="font-semibold text-green-900">Stocks OK</p>
            <p className="text-sm text-green-700">Aucune alerte stock pour le moment</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <AlertTriangle className="text-orange-500" size={20} />
        Alertes Stocks ({alerts.length})
      </h3>

      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`rounded-xl p-4 border-2 ${
            alert.level === 'critical'
              ? 'bg-red-50 border-red-300'
              : 'bg-yellow-50 border-yellow-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 ${
                alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
              }`}
            >
              {alert.level === 'critical' ? (
                <AlertTriangle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>

            <div className="flex-1">
              <p
                className={`font-semibold ${
                  alert.level === 'critical' ? 'text-red-900' : 'text-yellow-900'
                }`}
              >
                {alert.item}
              </p>
              <p
                className={`text-sm ${
                  alert.level === 'critical' ? 'text-red-700' : 'text-yellow-700'
                }`}
              >
                {alert.message}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`text-2xl font-bold ${
                  alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
                }`}
              >
                {alert.quantity}
              </p>
              <p className="text-xs text-slate-500">Seuil: {alert.threshold}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
