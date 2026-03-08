'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle,
  ChefHat,
  Clock,
  CreditCard,
  FileText,
  Flame,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingCart,
  Sparkles,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion'
import { useParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { contactInfo } from '@/data/menuData'
import { getOrderByToken as getOrderByTokenLocal } from '@/lib/localStore'
import type { Order, OrderStatus } from '@/types/order'
import { PendingValidationView } from './PendingValidationView'
import { useQueueEstimate } from '@/hooks/useQueueEstimate'

const FINAL_STATUSES: OrderStatus[] = ['refused', 'cancelled', 'completed']

const TOAST_MESSAGES: Partial<Record<OrderStatus, string>> = {
  waiting_payment: '✅ Commande validée ! Procédez au paiement.',
  paid: '💳 Paiement confirmé !',
  in_preparation: '🔥 En préparation !',
  ready: '🎉 Votre commande est prête !',
  refused: '❌ Commande refusée.',
  cancelled: '❌ Commande annulée.',
}

const STATUS_GRADIENTS: Partial<Record<OrderStatus, string>> = {
  waiting_payment: 'from-green-500 to-emerald-400',
  paid:            'from-orange-400 to-amber-300',
  in_preparation:  'from-[#E17B5F] to-[#C4522A]',
  ready:           'from-[#C4522A] to-[#8B3622]',
  in_delivery:     'from-indigo-500 to-violet-400',
  completed:       'from-emerald-500 to-teal-400',
  refused:         'from-red-500 to-red-400',
  cancelled:       'from-gray-400 to-gray-500',
}

const sanitizePhone = (phone: string) => phone.replace(/\D/g, '')

function CancelConfirmModal({
  onConfirm,
  onClose,
  loading,
}: {
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center">
        <p className="text-lg font-bold text-gray-900 mb-2">Annuler la commande ?</p>
        <p className="text-gray-600 text-sm mb-6">
          Cette action est définitive. Vous pourrez passer une nouvelle commande à tout moment.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Garder ma commande
          </Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={onConfirm} disabled={loading}>
            {loading ? 'Annulation…' : 'Oui, annuler'}
          </Button>
        </div>
      </div>
    </div>
  )
}

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'pending_validation':
      return {
        title: 'En attente de validation',
        description: 'Cette page se met à jour automatiquement.',
        helper: '',
        helperIcon: Clock,
        icon: Clock,
        accent: 'text-orange-600',
      }
    case 'waiting_payment':
      return {
        title: 'Commande validée !',
        description: 'Procédez au paiement pour confirmer votre commande.',
        helper: 'Vous avez 15 minutes pour finaliser le paiement.',
        helperIcon: MessageCircle,
        icon: CheckCircle,
        accent: 'text-green-600',
      }
    case 'paid':
      return {
        title: 'Paiement confirmé ! En préparation',
        description: 'Votre commande est payée. La préparation va bientôt commencer.',
        helper: 'Merci pour votre confiance.',
        helperIcon: CheckCircle,
        icon: CreditCard,
        accent: 'text-green-600',
      }
    case 'in_preparation':
      return {
        title: 'En préparation',
        description:
          'Guylian prépare votre commande avec soin. Vous serez prévenu(e) dès qu\u2019elle est prête.',
        helper: 'Temps estimé : 20-30 minutes',
        helperIcon: Flame,
        icon: ChefHat,
        accent: 'text-orange-600',
      }
    case 'ready':
      return {
        title: 'Commande prête !',
        description: 'Vous pouvez venir récupérer votre commande dès maintenant.',
        helper: 'Merci de présenter votre numéro de commande.',
        helperIcon: Sparkles,
        icon: Sparkles,
        accent: 'text-green-600',
      }
    case 'in_delivery':
      return {
        title: 'Commande en livraison',
        description: 'Votre commande est en route. Elle arrive très bientôt !',
        helper: 'Restez joignable par téléphone.',
        helperIcon: MapPin,
        icon: MapPin,
        accent: 'text-indigo-600',
      }
    case 'completed':
      return {
        title: 'Commande terminée',
        description: 'Merci pour votre commande ! N\u2019hésitez pas à revenir.',
        helper: 'À très vite chez Pizza dal Cielo.',
        helperIcon: Sparkles,
        icon: Sparkles,
        accent: 'text-green-600',
      }
    case 'cancelled':
      return {
        title: 'Commande annulée',
        description: 'Votre commande a été annulée. Contactez-nous si besoin.',
        helper: 'Nous restons à votre disposition.',
        helperIcon: XCircle,
        icon: XCircle,
        accent: 'text-red-600',
      }
    case 'refused':
      return {
        title: 'Commande refusée',
        description: 'Désolé, nous ne pouvons pas honorer votre commande pour le moment.',
        helper: 'Vous pouvez commander à nouveau ou nous contacter.',
        helperIcon: XCircle,
        icon: XCircle,
        accent: 'text-red-600',
      }
  }
}

function AnimatedStatusIcon({ statusKey, Icon }: { statusKey: OrderStatus; Icon: LucideIcon }) {
  const anims: Partial<Record<OrderStatus, TargetAndTransition>> = {
    waiting_payment: { rotate: [0, 6, -6, 0] },
    in_preparation: { scale: [1, 1.12, 1] },
    ready: { scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] },
  }
  const anim = anims[statusKey]
  if (!anim) return <Icon size={26} />
  return (
    <motion.div animate={anim} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
      <Icon size={26} />
    </motion.div>
  )
}

function AnimatedTimeline({ status }: { status: OrderStatus }) {
  const steps = [
    {
      label: 'Reçue',
      done: true,
      active: false,
    },
    {
      label: 'Validée',
      done: status !== 'pending_validation',
      active: status === 'waiting_payment',
    },
    {
      label: 'Payée',
      done: ['paid', 'in_preparation', 'ready', 'in_delivery', 'completed'].includes(status),
      active: status === 'paid',
    },
    {
      label: 'En prépa.',
      done: ['ready', 'in_delivery', 'completed'].includes(status),
      active: status === 'in_preparation',
    },
    {
      label: 'Prête',
      done: ['ready', 'in_delivery', 'completed'].includes(status),
      active: status === 'ready',
    },
  ]

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 && (
              <div className="flex-1 relative h-0.5 bg-gray-200 overflow-hidden mx-1">
                <motion.div
                  className="absolute inset-y-0 left-0 right-0 bg-[#E17B5F]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: steps[i - 1].done ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-1 shrink-0">
              {step.active ? (
                <div className="relative flex items-center justify-center w-7 h-7">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#E17B5F]/30"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="w-7 h-7 rounded-full bg-[#E17B5F] flex items-center justify-center text-white">
                    <CheckCircle size={14} strokeWidth={2.5} />
                  </div>
                </div>
              ) : step.done ? (
                <motion.div
                  className="w-7 h-7 rounded-full bg-[#E17B5F] flex items-center justify-center text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CheckCircle size={14} strokeWidth={2.5} />
                </motion.div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                  {i + 1}
                </div>
              )}
              <span
                className={`text-[10px] font-semibold text-center leading-tight ${
                  step.done || step.active ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export const OrderTrackingClient = ({ initialOrder }: { initialOrder?: Order | null }) => {
  const params = useParams()
  const pathname = usePathname()
  const token = useMemo(() => {
    if (initialOrder?.token) return initialOrder.token
    const value = params?.token
    const fromParams = Array.isArray(value) ? value[0] : value
    if (fromParams) return fromParams
    const match = pathname?.match(/\/order\/([a-f0-9-]+)/i)
    return match?.[1] ?? null
  }, [params, pathname, initialOrder?.token])

  const [order, setOrder] = useState<Order | null>(initialOrder ?? null)
  const [loading, setLoading] = useState(!initialOrder)
  const [notFound, setNotFound] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const hadWaitingPaymentRef = useRef(false)
  const hadInPreparationRef = useRef(false)
  const orderRef = useRef<Order | null>(null)
  const prevStatusRef = useRef<OrderStatus | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [elapsedMin, setElapsedMin] = useState(0)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    orderRef.current = order
  }, [order])

  // Si pas de token (params pas prêt), arrêter le loading après 1s pour afficher notFound
  useEffect(() => {
    if (!token && pathname) {
      const t = setTimeout(() => {
        if (!orderRef.current) {
          setLoading(false)
          setNotFound(true)
        }
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [token, pathname])

  // Timeout de secours : si chargement > 12s sans order, afficher l'écran d'erreur pour éviter blocage infini
  useEffect(() => {
    if (!token) return
    const t = setTimeout(() => {
      if (orderRef.current) return
      setFetchError(true)
      setLoading(false)
    }, 12000)
    return () => clearTimeout(t)
  }, [token])

  // Toast on status change (skip initial load)
  useEffect(() => {
    if (!order) return
    if (prevStatusRef.current !== null && order.status !== prevStatusRef.current) {
      const msg = TOAST_MESSAGES[order.status]
      if (msg) {
        setToast(msg)
        setTimeout(() => setToast(null), 4000)
      }
    }
    prevStatusRef.current = order.status
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status])

  // Elapsed time badge — only for paid / in_preparation
  useEffect(() => {
    if (!order?.created_at) return
    if (!['paid', 'in_preparation'].includes(order.status)) return
    const calc = () =>
      setElapsedMin(Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000))
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.created_at, order?.status])

  const showEstimate = order ? ['paid', 'in_preparation'].includes(order.status) : false
  const { estimate } = useQueueEstimate(showEstimate)

  const load = useCallback(async () => {
    if (!token) return
    setFetchError(false)
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const doFetch = async (): Promise<Response> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const url = `${base}/api/orders/${encodeURIComponent(token)}?_=${Date.now()}`
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return res
    }
    try {
      let res = await doFetch()
      // Retry 2x en cas de 500 (cold start Vercel, erreurs intermittentes)
      for (let i = 0; i < 2 && res.status === 500; i++) {
        await new Promise((r) => setTimeout(r, 1000))
        res = await doFetch()
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.order) {
        setOrder(data.order)
        setNotFound(false)
        return
      }
      if (res.status === 404) {
        const localOrder = typeof getOrderByTokenLocal === 'function' ? getOrderByTokenLocal(token) : null
        if (localOrder) {
          setOrder(localOrder)
          setNotFound(false)
          return
        }
        setOrder(null)
        setNotFound(true)
        return
      }
      setFetchError(true)
      const localOrder = typeof getOrderByTokenLocal === 'function' ? getOrderByTokenLocal(token) : null
      if (localOrder) {
        setOrder(localOrder)
        setNotFound(false)
      }
    } catch {
      setFetchError(true)
      const localOrder = typeof getOrderByTokenLocal === 'function' ? getOrderByTokenLocal(token) : null
      if (localOrder) {
        setOrder(localOrder)
        setNotFound(false)
      } else {
        setOrder(null)
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  const handleCancelClick = useCallback(() => setShowCancelConfirm(true), [])
  const handleCancelClose = useCallback(() => setShowCancelConfirm(false), [])

  const handleCancelConfirm = useCallback(async () => {
    if (!token) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(token)}/cancel`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.order) {
        setOrder(data.order)
        setShowCancelConfirm(false)
      } else {
        setToast((data?.error as string) || 'Impossible d’annuler. Réessayez.')
      }
    } catch {
      setToast('Erreur de connexion.')
    } finally {
      setCancelling(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    load()
    const isPending = order && ['pending_validation', 'waiting_payment'].includes(order.status)
    const pollMs = isPending ? 1000 : 5000
    const interval = window.setInterval(() => {
      const curr = orderRef.current
      if (curr && FINAL_STATUSES.includes(curr.status)) return
      load()
    }, pollMs)
    return () => window.clearInterval(interval)
  }, [token, load, order?.status])

  useEffect(() => {
    if (!token) return
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const current = orderRef.current
        if (current && !FINAL_STATUSES.includes(current.status)) load()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [token, load])

  const handleReorder = useCallback(() => {
    if (!order) return
    try {
      const cartItems = order.items.map((item) => ({
        id: typeof item.id === 'number' ? item.id : 0,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        customizations: item.customizations || [],
      }))
      localStorage.setItem(
        'pizza-cart-storage',
        JSON.stringify({ state: { items: cartItems }, version: 0 })
      )
    } catch {}
    window.location.href = '/menu'
  }, [order])

  useEffect(() => {
    if (order?.status === 'waiting_payment' && order?.payment_link && !hadWaitingPaymentRef.current) {
      hadWaitingPaymentRef.current = true
      try {
        if (typeof navigator.vibrate === 'function') navigator.vibrate(200)
      } catch {}
    }
  }, [order?.status, order?.payment_link])

  // Vibration quand la commande passe en préparation (page suivi ouverte)
  useEffect(() => {
    if (order?.status === 'in_preparation' && !hadInPreparationRef.current) {
      hadInPreparationRef.current = true
      try {
        if (typeof navigator.vibrate === 'function') navigator.vibrate([100, 50, 100])
      } catch {}
    }
  }, [order?.status])

  if (loading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream/40">
        <div className="text-center">
          <div className="text-5xl animate-spin" style={{ animationDuration: '6s' }}>
            🍕
          </div>
          <p className="text-gray-text mt-4">Chargement de votre commande...</p>
        </div>
      </div>
    )
  }

  if (fetchError && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream/40 px-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">🍕</div>
          <h1 className="text-2xl font-black mb-2">Erreur de chargement</h1>
          <p className="text-gray-text mb-6">
            Impossible de récupérer votre commande. Vérifiez votre connexion et réessayez.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => { setLoading(true); load(); }}>
              Réessayer
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => (window.location.href = '/')}>
              Retour à l&apos;accueil
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream/40 px-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">🍕</div>
          <h1 className="text-2xl font-black mb-2">Commande introuvable</h1>
          <p className="text-gray-text mb-6">
            Ce lien n&apos;est pas valide ou la commande a expiré.
          </p>
          <Button className="w-full" onClick={() => (window.location.href = '/')}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  if (order.status === 'pending_validation') {
    return (
      <>
        <PendingValidationView
          order={order}
          fetchError={fetchError}
          onRetry={load}
          onCancel={handleCancelClick}
        />
        {showCancelConfirm && (
          <CancelConfirmModal
            onConfirm={handleCancelConfirm}
            onClose={handleCancelClose}
            loading={cancelling}
          />
        )}
      </>
    )
  }

  const status = getStatusConfig(order.status)
  const StatusIcon = status.icon
  const HelperIcon = status.helperIcon
  const orderShortId = order.id.slice(0, 8).toUpperCase()
  const mapsAddress = `${contactInfo.address.street}, ${contactInfo.address.city}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsAddress)}`
  const whatsappUrl = `https://wa.me/${sanitizePhone(contactInfo.whatsapp)}`
  const callUrl = `tel:${sanitizePhone(contactInfo.phone)}`
  const serviceLabel =
    order.type_service === 'click_collect' ? 'Click & Collect' : 'Livraison'

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1a0f08] text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm max-w-xs text-center whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-cream/40 px-5 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {fetchError && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <p className="text-amber-800 font-medium">Erreur de chargement. Données affichées peuvent être anciennes.</p>
              <Button size="sm" onClick={() => load()}>Réessayer</Button>
            </div>
          )}

          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Pizza dal Cielo</p>
              <h1 className="text-2xl font-black">Suivi de commande</h1>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Commande</p>
              <p className="text-lg font-black">#{orderShortId}</p>
            </div>
          </header>

          {/* Status hero card with gradient banner */}
          <div className="rounded-3xl shadow-xl overflow-hidden" aria-live="polite">
            <div
              className={`h-16 bg-gradient-to-r ${
                STATUS_GRADIENTS[order.status] ?? 'from-gray-400 to-gray-500'
              }`}
            />
            <div className="bg-white px-6 pb-6 pt-2 text-center -mt-8 relative">
              <div
                className={`mx-auto mb-3 inline-flex items-center justify-center rounded-full p-3 bg-white shadow-lg ring-4 ring-white ${status.accent}`}
              >
                <AnimatedStatusIcon statusKey={order.status} Icon={StatusIcon} />
              </div>
              <h2 className="text-2xl font-black mb-2">{status.title}</h2>
              <p className="text-gray-text mb-4">{status.description}</p>
              {status.helper ? (
                <div className="inline-flex items-center gap-2 bg-cream/70 px-4 py-2 rounded-full text-sm font-semibold text-gray-600 mb-4">
                  <HelperIcon size={14} />
                  {status.helper}
                </div>
              ) : null}

              {/* Bandeau retard signalé */}
              {(() => {
                const delayMatch = order.notes?.match(/Retard signalé\s*:\s*(\d{2}:\d{2})/)
                if (!delayMatch) return null
                return (
                  <div className="mb-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-2xl text-sm font-semibold">
                    <Clock size={15} className="text-amber-500 shrink-0" />
                    Nouvelle heure estimée : <strong>{delayMatch[1]}</strong>
                  </div>
                )
              })()}

              {/* Elapsed badge */}
              {['paid', 'in_preparation'].includes(order.status) && elapsedMin > 0 && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Clock size={12} />
                    En attente depuis {elapsedMin} min
                  </span>
                </div>
              )}

              {/* Queue estimate pill */}
              {showEstimate && (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold bg-white/80 px-4 py-2 rounded-full border border-white/30 shadow-sm">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        estimate.estimatedMinutes <= 20
                          ? 'bg-green-500 animate-pulse'
                          : 'bg-amber-500 animate-pulse'
                      }`}
                    />
                    <span>🍕 Prêt en ~{estimate.estimatedMinutes} min</span>
                  </div>
                </div>
              )}

              {/* Payment CTA */}
              {order.status === 'waiting_payment' && order.payment_link && (
                <div className="mt-6 space-y-3">
                  <a
                    href={order.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-2xl bg-gradient-to-r from-[#E17B5F] to-[#D4633F] text-white font-bold py-5 px-6 shadow-xl shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-xl"
                    aria-label={`Payer maintenant : ${order.total} euros`}
                  >
                    💳 Payer maintenant — {order.total}€
                  </a>
                  <p className="text-sm text-gray-500 text-center">⏰ Vous avez 15 minutes pour finaliser le paiement.</p>
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    className="w-full text-sm text-gray-500 hover:text-red-600 underline transition-colors"
                  >
                    Annuler ma commande
                  </button>
                </div>
              )}

              {/* Refused */}
              {order.status === 'refused' && (
                <div className="mt-6 space-y-3">
                  {order.refusal_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left">
                      <p className="text-sm font-bold text-red-700 mb-1">Motif du refus :</p>
                      <p className="text-sm text-red-600">{order.refusal_reason}</p>
                    </div>
                  )}
                  <button
                    onClick={handleReorder}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-4 py-4 font-bold hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart size={18} /> Commander à nouveau
                  </button>
                  <Button variant="secondary" className="w-full" onClick={() => (window.location.href = '/')}>
                    Retour à l&apos;accueil
                  </Button>
                </div>
              )}

              {/* Cancelled */}
              {order.status === 'cancelled' && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleReorder}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-4 py-4 font-bold hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart size={18} /> Commander à nouveau
                  </button>
                  <Button variant="secondary" className="w-full" onClick={() => (window.location.href = '/')}>
                    Retour à l&apos;accueil
                  </Button>
                </div>
              )}

              <AnimatedTimeline status={order.status} />
            </div>
          </div>

          {showCancelConfirm && (
            <CancelConfirmModal
              onConfirm={handleCancelConfirm}
              onClose={handleCancelClose}
              loading={cancelling}
            />
          )}

          {/* Order summary */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Récapitulatif</h3>
              <span className="text-sm text-gray-text">{formatDateTime(order.created_at)}</span>
            </div>
            <div className="space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.id}`} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-bold">{item.price}€</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-black">
              <span>Total</span>
              <span className="text-primary">{order.total}€</span>
            </div>
            <div className="border-t border-gray-100 pt-4 text-sm text-gray-text space-y-2">
              <p>👤 {order.client_name}</p>
              <p>📱 {order.client_phone}</p>
              <p>📍 {serviceLabel}</p>
              <p>🕐 {order.heure_souhaitee || 'Heure à préciser'}</p>
            </div>
          </div>

          {/* Reçu client — PDF n8n si disponible, sinon page imprimable */}
          {['waiting_payment', 'paid', 'in_preparation', 'ready', 'in_delivery', 'completed'].includes(order.status) && (
            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black">Votre reçu</h3>
                  <p className="text-sm text-gray-text">
                    {order.receipt_pdf_url
                      ? 'Téléchargez le reçu PDF de votre commande (le même que celui envoyé par email).'
                      : order.status === 'paid' || ['in_preparation', 'ready', 'in_delivery', 'completed'].includes(order.status)
                        ? 'Un reçu PDF vous a été envoyé par email. Vous pouvez aussi consulter le récapitulatif ci-dessous.'
                        : 'Consultez ou imprimez le récapitulatif de votre commande.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {order.receipt_pdf_url && (
                  <a
                    href={order.receipt_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary text-white px-4 py-4 font-bold hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <FileText size={20} /> Télécharger le reçu PDF
                  </a>
                )}
                <Link
                  href={`/order/${order.token}/receipt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-4 font-bold transition-all ${
                    order.receipt_pdf_url
                      ? 'border-2 border-primary text-primary hover:bg-primary/5'
                      : 'bg-primary text-white hover:opacity-90 active:scale-[0.98]'
                  }`}
                >
                  <FileText size={20} /> {order.receipt_pdf_url ? 'Voir le récapitulatif / Imprimer' : 'Voir le reçu / Imprimer'}
                </Link>
              </div>
            </div>
          )}

          {/* Help section (active orders only) */}
          {!['completed', 'refused', 'cancelled'].includes(order.status) && (
            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
              <h3 className="text-lg font-black">Besoin d&apos;aide ?</h3>
              <p className="text-gray-text">
                Votre page se met à jour automatiquement. Vous pouvez contacter Guylian à tout moment si besoin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 text-white px-4 py-3 font-bold"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
                <a
                  href={callUrl}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 font-bold"
                >
                  <Phone size={18} /> Appeler
                </a>
              </div>
              {order.status === 'ready' && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-4 py-3 font-bold w-full"
                >
                  <MapPin size={18} /> Ouvrir dans Maps
                </a>
              )}
            </div>
          )}

          {/* Completed — reorder */}
          {order.status === 'completed' && (
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center space-y-4">
              <p className="text-4xl">🍕</p>
              <h3 className="text-lg font-black">Vous avez apprécié ?</h3>
              <p className="text-gray-text text-sm">Recommandez la même chose en un clic — votre panier sera pré-rempli.</p>
              <button
                onClick={handleReorder}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-4 py-4 font-bold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <ShoppingCart size={18} /> Commander à nouveau
              </button>
              <a
                href={callUrl}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 font-bold"
              >
                <Phone size={18} /> Appeler
              </a>
            </div>
          )}

          {/* Contact info */}
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-black">Nous contacter</h3>
            <div className="text-gray-text text-sm space-y-3">
              <p className="font-semibold text-gray-800">{contactInfo.name}</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 hover:text-primary transition-colors"
              >
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>
                  {contactInfo.address.street}, {contactInfo.address.postalCode} {contactInfo.address.city}
                </span>
              </a>
              <a href={callUrl} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone size={18} className="shrink-0" />
                <span>{contactInfo.phone}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <MessageCircle size={18} className="shrink-0" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <span className="text-base">✉</span>
                <span>{contactInfo.email}</span>
              </a>
            </div>
          </div>

          <div className="text-center">
            <Button variant="secondary" onClick={() => (window.location.href = '/')}>
              Retour à l&apos;accueil
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
