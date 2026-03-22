'use client'

import { useMemo, useState, useEffect } from 'react'
import { Download, FileText, ExternalLink, X, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminCard, adminFocusRing } from '@/components/admin/adminUi'
import type { Order } from '@/types/order'
import { getCsrfToken } from '@/lib/csrf'
import { useAdminToast } from '@/components/admin/AdminToast'

interface ReceiptsManagerProps {
  orders: Order[]
  adminPin: string
  onRefresh?: () => void
}

type Period = 'today' | 'week' | 'month' | 'all' | 'custom'

const RECEIPT_CATEGORIES = [
  { value: '', label: '—' },
  { value: 'Comptabilité OK', label: 'Comptabilité OK' },
  { value: 'À archiver', label: 'À archiver' },
  { value: 'Litige', label: 'Litige' },
  { value: 'Autre', label: 'Autre' },
] as const

const RECEIPT_STATUSES = new Set(['paid', 'in_preparation', 'ready', 'in_delivery', 'completed'])

const statusLabels: Record<string, string> = {
  paid: 'Payée',
  in_preparation: 'En préparation',
  ready: 'Prête',
  in_delivery: 'En livraison',
  completed: 'Terminée',
}

function startOfDay(d: Date) {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

function toMartiniqueDate(iso: string) {
  return new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'America/Martinique' }))
}

export function ReceiptsManager({ orders, adminPin, onRefresh }: ReceiptsManagerProps) {
  const { showToast } = useAdminToast()
  const [period, setPeriod] = useState<Period>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null)
  const [updatingCategoryOrderId, setUpdatingCategoryOrderId] = useState<string | null>(null)

  // Fermer la modal avec Escape
  useEffect(() => {
    if (!selectedOrderForReceipt) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedOrderForReceipt(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedOrderForReceipt])

  const filteredOrders = useMemo(() => {
    const now = new Date()
    const todayMq = toMartiniqueDate(now.toISOString())

    let from: Date | null = null
    let to: Date | null = null

    if (period === 'today') {
      from = startOfDay(todayMq)
    } else if (period === 'week') {
      const d = new Date(todayMq)
      d.setDate(d.getDate() - 6)
      from = startOfDay(d)
    } else if (period === 'month') {
      from = new Date(todayMq.getFullYear(), todayMq.getMonth(), 1)
    } else if (period === 'custom') {
      if (customFrom) from = new Date(`${customFrom}T00:00:00`)
      if (customTo) to = new Date(`${customTo}T23:59:59`)
    }

    return orders
      .filter((o) => RECEIPT_STATUSES.has(o.status))
      .filter((o) => {
        const d = new Date(o.created_at)
        if (from && d < from) return false
        if (to && d > to) return false
        if (categoryFilter !== '') {
          const cat = o.receipt_category ?? ''
          if (cat !== categoryFilter) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [orders, period, customFrom, customTo, categoryFilter])

  const kpis = useMemo(() => {
    const total = filteredOrders.reduce((s, o) => s + o.total, 0)
    return { count: filteredOrders.length, total }
  }, [filteredOrders])

  const handleCategoryChange = async (order: Order, newCategory: string) => {
    setUpdatingCategoryOrderId(order.id)
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify({
          status: order.status,
          receipt_category: newCategory || null,
        }),
      })
      if (res.ok) {
        onRefresh?.()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast('error', data?.error || 'Erreur lors de la mise à jour de la catégorie.')
      }
    } catch {
      showToast('error', 'Erreur réseau.')
    } finally {
      setUpdatingCategoryOrderId(null)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (period === 'today') {
        const d = new Date().toISOString().slice(0, 10)
        params.set('from', d)
        params.set('to', d)
      } else if (period === 'week') {
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - 6)
        params.set('from', from.toISOString().slice(0, 10))
        params.set('to', to.toISOString().slice(0, 10))
      } else if (period === 'month') {
        const now = new Date()
        const from = new Date(now.getFullYear(), now.getMonth(), 1)
        params.set('from', from.toISOString().slice(0, 10))
        params.set('to', now.toISOString().slice(0, 10))
      } else if (period === 'custom') {
        if (customFrom) params.set('from', customFrom)
        if (customTo) params.set('to', customTo)
      }

      const res = await fetch(`/api/admin/orders/export?${params.toString()}`, {
        headers: { 'x-admin-pin': adminPin },
      })
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `commandes_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      showToast('error', "Erreur lors de l'export. Réessayez.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Period selector + Export */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {([
            { id: 'today', label: "Aujourd'hui" },
            { id: 'week', label: 'Cette semaine' },
            { id: 'month', label: 'Ce mois' },
            { id: 'all', label: 'Tout' },
            { id: 'custom', label: 'Période…' },
          ] as { id: Period; label: string }[]).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={cn(
                'min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition-colors touch-manipulation',
                adminFocusRing,
                period === p.id
                  ? 'bg-gradient-to-r from-coral to-burnt-orange text-white shadow-md shadow-coral/20'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || filteredOrders.length === 0}
          className={cn(
            'flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation',
            adminFocusRing
          )}
        >
          <Download size={16} />
          {isExporting ? 'Export…' : 'Exporter CSV'}
        </button>
      </div>

      {/* Custom date range */}
      {period === 'custom' && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600 shrink-0">Du</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="min-h-[40px] px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600 shrink-0">Au</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="min-h-[40px] px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 transition-all"
            />
          </div>
        </div>
      )}

      {/* Filtre catégorie */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-slate-600 shrink-0">Catégorie</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="min-h-[40px] px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 transition-all"
        >
          {RECEIPT_CATEGORIES.map((c) => (
            <option key={c.value || '_all'} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* KPI banner */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Commandes" value={String(kpis.count)} color="slate" />
        <KpiCard label="CA total" value={`${kpis.total.toFixed(2)} €`} color="green" />
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className={cn(adminCard, 'p-10 text-center md:p-12')}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <FileText className="text-slate-400" size={32} aria-hidden />
          </div>
          <p className="text-lg font-medium text-slate-600">Aucune commande sur cette période</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className={cn(adminCard, 'hidden overflow-hidden p-0 md:block')}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">#ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Tél</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Service</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Articles</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Total</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Reçu</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Catégorie</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredOrders.map((o) => {
                    const nbArticles = o.items.reduce((s, i) => s + i.quantity, 0)
                    const isUpdating = updatingCategoryOrderId === o.id
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(o.created_at).toLocaleDateString('fr-FR', {
                            timeZone: 'America/Martinique',
                            day: '2-digit', month: '2-digit', year: 'numeric',
                          })}
                          {' '}
                          <span className="text-slate-400">
                            {new Date(o.created_at).toLocaleTimeString('fr-FR', {
                              timeZone: 'America/Martinique',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 max-w-[160px] truncate">
                          {o.client_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          <a href={`tel:${o.client_phone}`} className="hover:text-coral hover:underline">
                            {o.client_phone}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {o.type_service === 'delivery' ? '🚗 Livraison' : '🏪 Click & Collect'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">{nbArticles}</td>
                        <td className="px-4 py-3 text-right font-bold text-coral">{o.total.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForReceipt(o)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-coral/10 text-coral rounded-lg text-xs font-semibold hover:bg-coral/20 transition-colors"
                            >
                              <Eye size={12} />
                              Voir le reçu
                            </button>
                            <ReceiptBadge order={o} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={o.receipt_category ?? ''}
                            onChange={(e) => handleCategoryChange(o, e.target.value)}
                            disabled={isUpdating}
                            className="text-xs font-medium border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/20 disabled:opacity-50"
                          >
                            {RECEIPT_CATEGORIES.map((c) => (
                              <option key={c.value || '_none'} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium text-slate-600">
                            {statusLabels[o.status] ?? o.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((o) => {
              const nbArticles = o.items.reduce((s, i) => s + i.quantity, 0)
              return (
                <div key={o.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-bold text-slate-800">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('fr-FR', {
                          timeZone: 'America/Martinique',
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <p className="text-xl font-black text-coral">{o.total.toFixed(2)} €</p>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600 mb-3">
                    <p className="font-medium text-slate-900">{o.client_name}</p>
                    <p>{o.client_phone} · {nbArticles} article{nbArticles > 1 ? 's' : ''}</p>
                    <p>{o.type_service === 'delivery' ? '🚗 Livraison' : '🏪 Click & Collect'} · {o.heure_souhaitee}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase shrink-0">Catégorie</label>
                      <select
                        value={o.receipt_category ?? ''}
                        onChange={(e) => handleCategoryChange(o, e.target.value)}
                        disabled={updatingCategoryOrderId === o.id}
                        className="flex-1 text-xs font-medium border border-slate-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:border-coral disabled:opacity-50"
                      >
                        {RECEIPT_CATEGORIES.map((c) => (
                          <option key={c.value || '_none'} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-500">{statusLabels[o.status] ?? o.status}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForReceipt(o)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-coral/10 text-coral rounded-xl text-xs font-semibold hover:bg-coral/20 transition-colors"
                        >
                          <Eye size={14} />
                          Voir le reçu
                        </button>
                        <ReceiptBadge order={o} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Modal reçu client (iframe) */}
      {selectedOrderForReceipt && (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Reçu client"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
            <span className="font-semibold text-slate-800">
              Reçu — {selectedOrderForReceipt.client_name} · #{selectedOrderForReceipt.id.slice(0, 8).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => setSelectedOrderForReceipt(null)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 min-h-0 p-2 md:p-4">
            <iframe
              title={`Reçu commande ${selectedOrderForReceipt.token}`}
              src={`/order/${selectedOrderForReceipt.token}/receipt`}
              className="w-full h-full min-h-[70vh] rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ReceiptBadge({ order }: { order: Order }) {
  return (
    <a
      href={`/order/${order.token}/receipt`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
    >
      <ExternalLink size={11} />
      Reçu
    </a>
  )
}

function KpiCard({ label, value, color }: { label: string; value: string; color: 'slate' | 'green' | 'orange' | 'red' }) {
  const colors = {
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    orange: 'bg-orange-50 border-orange-100 text-orange-800',
    red: 'bg-red-50 border-red-100 text-red-800',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}
