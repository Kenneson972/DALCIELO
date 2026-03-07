'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, User, MapPin, ChevronRight } from 'lucide-react'
import type { Order, OrderStatus } from '@/types/order'

type KitchenStatus = 'ready' | 'in_preparation'

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function KitchenMode({
  orders: ordersProp = [],
  onStatusChange,
}: {
  orders?: Order[]
  onStatusChange: (id: string, status: KitchenStatus | OrderStatus, data?: Partial<Order>) => void | Promise<void>
}) {
  const orders = ordersProp
  const [currentIndex, setCurrentIndex] = useState(0)
  const [now, setNow] = useState(new Date())

  // Live clock + timer — updates every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (orders.length === 0) {
      setCurrentIndex(0)
      return
    }
    if (currentIndex > orders.length - 1) {
      setCurrentIndex(0)
    }
  }, [orders, currentIndex])

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-900 rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🍕</div>
          <p className="text-3xl text-white font-bold">Aucune commande en cours</p>
          <p className="text-lg text-slate-400 mt-3">En attente de nouvelles commandes...</p>
        </div>
      </div>
    )
  }

  const currentOrder = orders[currentIndex]

  const elapsedSeconds = currentOrder.preparation_started_at
    ? Math.floor((now.getTime() - new Date(currentOrder.preparation_started_at).getTime()) / 1000)
    : 0
  const isOverdue = elapsedSeconds > 20 * 60

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < orders.length - 1 ? prev + 1 : 0))
  }

  const handleStartPreparation = () => {
    const estimatedDate = new Date(Date.now() + 20 * 60000)
    onStatusChange(currentOrder.id, 'in_preparation', {
      preparation_started_at: new Date().toISOString(),
      estimated_ready_time: estimatedDate.toISOString(),
    })
  }

  const handleMarkReady = () => {
    onStatusChange(currentOrder.id, 'ready', {
      actual_ready_time: new Date().toISOString(),
    })
    handleNext()
  }

  const clockDisplay = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-slate-900 text-white rounded-2xl md:rounded-3xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mode Cuisine</h1>
          <p className="text-base md:text-lg text-slate-400 mt-1">
            Commande {currentIndex + 1} / {orders.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl md:text-5xl font-bold text-orange-500 tabular-nums">
            {clockDisplay}
          </p>
        </div>
      </div>

      {/* Two-column layout on md+ */}
      <div className="md:grid md:grid-cols-[220px_1fr] md:gap-4">
        {/* Mini-list — tablet/desktop only */}
        <div className="hidden md:flex flex-col bg-slate-800 rounded-2xl overflow-hidden">
          <div className="px-3 py-2.5 border-b border-slate-700 shrink-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-y-auto flex-1">
            {orders.map((order, i) => {
              const orderElapsed = order.preparation_started_at
                ? Math.floor(
                    (now.getTime() - new Date(order.preparation_started_at).getTime()) / 1000
                  )
                : 0
              const orderOverdue = orderElapsed > 20 * 60
              return (
                <button
                  key={order.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full text-left px-3 py-3 border-b border-slate-700/50 transition-colors touch-manipulation ${
                    i === currentIndex
                      ? 'bg-orange-500/20 border-l-2 border-l-orange-500'
                      : 'hover:bg-slate-700 active:bg-slate-600'
                  }`}
                >
                  <p className="font-bold text-white text-sm truncate">{order.client_name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Pour {order.heure_souhaitee}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        order.status === 'in_preparation'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {order.status === 'in_preparation' ? 'En prép.' : 'Payée'}
                    </span>
                    {order.preparation_started_at && (
                      <span
                        className={`text-[10px] font-mono tabular-nums ${
                          orderOverdue ? 'text-red-400 animate-pulse' : 'text-slate-400'
                        }`}
                      >
                        {formatTimer(orderElapsed)}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Order detail */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentOrder.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="bg-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 border-4 border-orange-500"
            >
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Commande #{currentOrder.id.slice(0, 8)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-base md:text-lg">
                  <div className="flex items-center gap-3">
                    <User size={22} className="text-orange-500 shrink-0" />
                    <span className="truncate">{currentOrder.client_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={22} className="text-orange-500 shrink-0" />
                    <span>
                      {currentOrder.type_service === 'click_collect' ? 'Click & Collect' : 'Livraison'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={22} className="text-orange-500 shrink-0" />
                    <span>Pour {currentOrder.heure_souhaitee}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {currentOrder.items.map((item, index) => (
                  <div
                    key={`${currentOrder.id}-${item.id}-${index}`}
                    className="bg-slate-700 rounded-2xl p-4 border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-2xl md:text-3xl font-bold">
                        {item.quantity}x {item.name}
                      </h3>
                      <span className="text-3xl">
                        {item.category === 'Pizzas' ||
                        ['Classique', 'Du Chef'].includes(item.category)
                          ? '🍕'
                          : item.category === 'Friands'
                          ? '🥟'
                          : item.category === 'Fromages'
                          ? '🧀'
                          : item.category === 'Viandes'
                          ? '🥩'
                          : item.category === 'Légumes'
                          ? '🥗'
                          : '➕'}
                      </span>
                    </div>
                    {item.customizations && item.customizations.length > 0 && (
                      <p className="text-base text-slate-300">{item.customizations.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Timer banner — affiché quand la préparation a commencé */}
              {currentOrder.preparation_started_at && (
                <div
                  className={`rounded-2xl p-4 mb-6 border ${
                    isOverdue
                      ? 'bg-red-500/20 border-red-500 animate-pulse'
                      : 'bg-orange-500/20 border-orange-500'
                  }`}
                >
                  <p className="text-xl font-bold text-center tabular-nums">
                    {isOverdue ? '🚨 ' : '⏱ '}
                    En préparation depuis{' '}
                    <span className={`font-mono text-2xl ${isOverdue ? 'text-red-400' : 'text-orange-300'}`}>
                      {formatTimer(elapsedSeconds)}
                    </span>
                    {isOverdue && (
                      <span className="block text-sm text-red-300 mt-1 font-normal">
                        Délai dépassé — vérifier la commande
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Actions : si payée → Commencer la préparation ; si en prép. → Marquer comme prête */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                {currentOrder.status === 'paid' ? (
                  <>
                    <button
                      onClick={handleStartPreparation}
                      className="flex-1 min-h-[52px] md:min-h-[60px] bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-4 rounded-2xl font-bold text-lg md:text-2xl transition-colors touch-manipulation"
                    >
                      Commencer la préparation
                    </button>
                    <button
                      onClick={handleNext}
                      className="min-h-[52px] md:min-h-[60px] bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white px-6 md:px-8 rounded-2xl font-bold text-lg md:text-xl transition-colors flex items-center justify-center gap-2 touch-manipulation"
                    >
                      Suivante <ChevronRight size={24} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleMarkReady}
                      className="flex-1 min-h-[52px] md:min-h-[60px] bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg md:text-2xl transition-colors touch-manipulation"
                    >
                      Marquer comme PRÊTE
                    </button>
                    <button
                      onClick={handleNext}
                      className="min-h-[52px] md:min-h-[60px] bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white px-6 md:px-8 rounded-2xl font-bold text-lg md:text-xl transition-colors flex items-center justify-center gap-2 touch-manipulation"
                    >
                      Suivante <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
