'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, User, Phone, ChevronDown, ChevronUp, ShoppingBag, Calendar, Search, X } from 'lucide-react'
import { updateOrderStatus } from '@/lib/localStore'
import { QuickActions } from './QuickActions'
import type { Order, OrderStatus } from '@/types/order'

interface OrdersListProps {
  orders: Order[]
  onRefresh: () => void | Promise<void>
  onStatusChange?: (orderId: string, newStatus: OrderStatus, data?: Partial<Order>) => void | Promise<void>
}

const statusLabels: Record<OrderStatus, string> = {
  pending_validation: '⏳ À valider',
  waiting_payment: '💳 Attente paiement',
  paid: '✅ Payée',
  in_preparation: '👨‍🍳 En préparation',
  ready: '🎉 Prête',
  in_delivery: '🚗 En livraison',
  completed: '✔️ Terminée',
  cancelled: '❌ Annulée',
  refused: '🚫 Refusée',
}

const statusStyles: Record<OrderStatus, string> = {
  pending_validation: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
  waiting_payment: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  paid: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
  in_preparation: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
  ready: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  in_delivery: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
  completed: 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
  refused: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
}

export function OrdersList({ orders, onRefresh, onStatusChange }: OrdersListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const q = searchQuery.trim().toLowerCase()

  const filteredOrders = orders.filter((order) => {
    if (q) {
      const matchName = order.client_name.toLowerCase().includes(q)
      const matchPhone = order.client_phone.includes(q)
      if (!matchName && !matchPhone) return false
    }
    if (filter === 'active') {
      return ['pending_validation', 'paid', 'in_preparation', 'ready', 'in_delivery', 'waiting_payment'].includes(
        order.status
      )
    }
    if (filter === 'completed') {
      return ['completed', 'cancelled', 'refused'].includes(order.status)
    }
    return true
  })

  // Sort: pending first, then by date desc
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.status === 'pending_validation' && b.status !== 'pending_validation') return -1
    if (a.status !== 'pending_validation' && b.status === 'pending_validation') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const handleStatusChange = async (orderId: string, newStatus: string, data?: Partial<Order>) => {
    if (onStatusChange) {
      await onStatusChange(orderId, newStatus as OrderStatus, data)
    } else {
      updateOrderStatus(orderId, newStatus as OrderStatus, data)
      await (typeof onRefresh === 'function' ? onRefresh() : undefined)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Search input */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par nom ou téléphone..."
          className="w-full pl-10 pr-10 py-3 min-h-[48px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-800 placeholder:text-slate-400 transition-all text-sm md:text-base touch-manipulation"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
            aria-label="Effacer la recherche"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 sticky top-4 md:top-4 z-20 bg-slate-50/95 backdrop-blur py-2 -mx-4 px-4 md:static md:bg-transparent md:py-0 md:px-0">
        <FilterButton
          active={filter === 'active'}
          onClick={() => setFilter('active')}
          label="En cours"
          count={
            orders.filter((o) =>
              ['pending_validation', 'paid', 'in_preparation', 'ready', 'in_delivery', 'waiting_payment'].includes(o.status)
            ).length
          }
        />
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Toutes"
          count={orders.length}
        />
        <FilterButton
          active={filter === 'completed'}
          onClick={() => setFilter('completed')}
          label="Terminées"
          count={orders.filter((o) => ['completed', 'cancelled', 'refused'].includes(o.status)).length}
        />
      </div>

      <div className="space-y-4">
        {sortedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 text-lg font-medium">Aucune commande</p>
          </div>
        ) : (
          sortedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
}

function FilterButton({ active, onClick, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        min-h-[44px] px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm touch-manipulation
        ${
          active
            ? 'bg-coral text-white shadow-lg shadow-coral/25 md:scale-105'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 active:bg-slate-200'
        }
      `}
    >
      {label} {count !== undefined && <span className={`ml-1 opacity-80 ${active ? 'text-white' : 'text-slate-400'}`}>({count})</span>}
    </button>
  )
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onStatusChange,
}: {
  order: Order
  expanded: boolean
  onToggle: () => void
  onStatusChange: (orderId: string, newStatus: string, data?: Partial<Order>) => void | Promise<void>
}) {
  const serviceLabel = order.type_service === 'click_collect' ? 'Click & Collect' : 'Livraison'
  const isPending = order.status === 'pending_validation'
  
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white rounded-2xl border overflow-hidden transition-all duration-300
        ${expanded ? 'shadow-xl ring-1 ring-coral/20 border-coral/30' : 'shadow-sm hover:shadow-md border-slate-200'}
        ${isPending ? 'border-l-4 border-l-yellow-400' : ''}
      `}
    >
      <div onClick={onToggle} className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className="text-lg font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[order.status]}`}>
                {statusLabels[order.status]}
              </span>
              {isPending && (
                <span className="animate-pulse px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase tracking-wider">
                  Action requise
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="font-medium text-slate-900 truncate">{order.client_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <span>Pour <span className="font-bold text-slate-900">{order.heure_souhaitee}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span>{serviceLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <a href={`tel:${order.client_phone}`} onClick={(e) => e.stopPropagation()} className="hover:text-coral hover:underline">
                  {order.client_phone}
                </a>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-2 mb-1">
              <p className="text-2xl font-black text-coral">{order.total.toFixed(2)}€</p>
              {order.receipt_pdf_url && (
                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-semibold">📄 PDF</span>
              )}
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
              <Calendar size={12} />
              {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <div className={`p-1 rounded-full transition-colors ${expanded ? 'bg-coral/10 text-coral' : 'text-slate-300'}`}>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/50"
          >
            <div className="p-6 space-y-6">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-coral" />
                  Détail de la commande
                </h4>
                {order.type_service === 'delivery' && order.delivery_address && (
                  <div className="flex items-start gap-2 mb-3 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <span>{order.delivery_address}</span>
                  </div>
                )}
                <div className="space-y-2">
                  {(() => {
                    // Grouper les suppléments sous leur pizza parente
                    type OrderItem = { name?: string; price?: number; quantity?: number; category?: string; customizations?: string[] }
                    type GroupedItem = { item: OrderItem; supplements: OrderItem[] }
                    const grouped: GroupedItem[] = []
                    for (const item of order.items as OrderItem[]) {
                      if (item.category === 'Suppléments') {
                        if (grouped.length > 0) grouped[grouped.length - 1].supplements.push(item)
                      } else {
                        grouped.push({ item, supplements: [] })
                      }
                    }
                    return grouped.map(({ item, supplements }, index) => (
                      <div key={index} className="py-2 border-b border-slate-100 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-sm">
                                {item.quantity}x
                              </span>
                              <span className="font-medium text-slate-800">{item.name}</span>
                            </div>
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="mt-1 ml-9 space-y-0.5">
                                {item.customizations.map((c: string, ci: number) => (
                                  <p key={ci} className={`text-xs font-medium ${c.startsWith('Suppléments') ? 'text-coral' : 'text-slate-500'}`}>
                                    {c.startsWith('Suppléments') ? `+ ${c.replace('Suppléments: ', '')}` : c}
                                  </p>
                                ))}
                              </div>
                            )}
                            {supplements.length > 0 && (
                              <div className="ml-9 mt-1.5 space-y-0.5">
                                {supplements.map((sup: OrderItem, si: number) => (
                                  <p key={si} className="text-xs text-coral font-medium">
                                    + {sup.name} ({(sup.price ?? 0).toFixed(2)}€)
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-slate-600 shrink-0 ml-4">
                            {((item.price ?? 0) * (item.quantity ?? 1) + supplements.reduce((s: number, sup: OrderItem) => s + (sup.price ?? 0) * (sup.quantity ?? 1), 0)).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
                {(() => {
                  const itemsSubtotal = Math.round(order.items.reduce((s: number, i: { price?: number; quantity?: number }) => s + (i.price ?? 0) * (i.quantity ?? 1), 0) * 100) / 100
                  const deliveryFee = Math.round((order.total - itemsSubtotal) * 100) / 100
                  return (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      {order.type_service === 'delivery' && deliveryFee > 0 && (
                        <>
                          <div className="flex justify-between text-sm text-slate-500">
                            <span>Sous-total articles</span>
                            <span>{itemsSubtotal.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between text-sm text-slate-500">
                            <span className="flex items-center gap-1"><MapPin size={13} />Frais de livraison</span>
                            <span>{deliveryFee.toFixed(2)}€</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="text-xl font-black text-coral">{order.total.toFixed(2)}€</span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {order.notes && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-1 text-sm">Note client :</h4>
                  <p className="text-yellow-700 text-sm italic">
                    "{order.notes}"
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-2">
                {order.receipt_pdf_url ? (
                  <a
                    href={order.receipt_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors touch-manipulation"
                  >
                    📄 Voir le reçu PDF
                  </a>
                ) : (
                  <a
                    href={`/order/${order.token}/receipt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors touch-manipulation"
                  >
                    🖨️ Reçu HTML
                  </a>
                )}
              </div>
              <div className="pt-2">
                <QuickActions
                  order={order}
                  onStatusChange={(newStatus, data) => onStatusChange(order.id, newStatus, data)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
