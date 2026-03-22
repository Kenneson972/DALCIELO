'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Clock,
  TrendingUp,
  Package,
  ChefHat,
  LayoutDashboard,
  Download,
  Menu,
  X,
  LogOut,
  Flame,
  UtensilsCrossed,
  RefreshCw,
  Megaphone,
  Star,
  SlidersHorizontal,
  Power,
  FileText,
  Home,
  Loader2,
  Pizza,
  LineChart as LineChartIcon,
  BarChart3 as BarChart3Icon,
  PieChart,
  IceCream,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { exportOrdersToCSV } from '@/lib/localStore'
import { useQueueEstimate } from '@/hooks/useQueueEstimate'
import dynamic from 'next/dynamic'
import { KPICard } from '@/components/admin/KPICard'
const RevenueChart = dynamic(
  () => import('@/components/admin/RevenueChart').then((m) => m.RevenueChart),
  { ssr: false }
)
import { StockAlerts } from '@/components/admin/StockAlerts'
import { TopPizzas } from '@/components/admin/TopPizzas'
import { OrdersList } from '@/components/admin/OrdersList'
import { StocksManager } from '@/components/admin/StocksManager'
import { KitchenMode } from '@/components/admin/KitchenMode'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { MenuManager } from '@/components/admin/MenuManager'
import { AnnouncementEditor } from '@/components/admin/AnnouncementEditor'
import { ReviewsManager } from '@/components/admin/ReviewsManager'
import { ReceiptsManager } from '@/components/admin/ReceiptsManager'
import { getCsrfToken } from '@/lib/csrf'
import { cn } from '@/lib/utils'
import {
  adminPageBg,
  adminToolbarChip,
  adminFocusRing,
  adminSectionLabel,
  adminBtnSecondary,
} from '@/components/admin/adminUi'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminSectionHeader } from '@/components/admin/ui/AdminSectionHeader'
import { AdminToastProvider } from '@/components/admin/AdminToast'
import type { Order, DashboardStats } from '@/types/order'

type ViewMode = 'dashboard' | 'orders' | 'receipts' | 'stocks' | 'analytics' | 'kitchen' | 'menu' | 'announcement' | 'reviews'

function computeDashboardStats(orders: Order[]): DashboardStats {
  const today = new Date().toDateString()
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today)
  const paidOrders = todayOrders.filter((o) =>
    ['paid', 'in_preparation', 'ready', 'in_delivery', 'completed'].includes(o.status)
  )
  const activeOrders = orders.filter((o) =>
    ['pending_validation', 'paid', 'in_preparation', 'ready', 'in_delivery'].includes(o.status)
  )
  const today_revenue = paidOrders.reduce((sum, o) => sum + o.total, 0)
  const completedWithTimes = paidOrders.filter(
    (o) => o.preparation_started_at && o.actual_ready_time
  )
  const avg_preparation_time =
    completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, o) => {
          const start = new Date(o.preparation_started_at!).getTime()
          const end = new Date(o.actual_ready_time!).getTime()
          return sum + (end - start) / 1000 / 60
        }, 0) / completedWithTimes.length
      : 0
  const totalToday = todayOrders.length
  const validated = todayOrders.filter((o) => o.status !== 'refused').length
  const validation_rate = totalToday > 0 ? (validated / totalToday) * 100 : 100
  const pizzaCount: Record<string, number> = {}
  paidOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (['Pizzas', 'Classique', 'Du Chef'].includes(item.category)) {
        pizzaCount[item.name] = (pizzaCount[item.name] || 0) + item.quantity
      }
    })
  })
  const top_pizzas = Object.entries(pizzaCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
  return {
    today_revenue,
    today_orders: paidOrders.length,
    active_orders: activeOrders.length,
    avg_preparation_time: Math.round(avg_preparation_time),
    validation_rate: Math.round(validation_rate),
    top_pizzas,
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [view, setView] = useState<ViewMode>('dashboard')
  const [mountedViews, setMountedViews] = useState<Set<ViewMode>>(new Set<ViewMode>(['dashboard']))
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats>(() => computeDashboardStats([]))
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncAge, setSyncAge] = useState(0)
  const [newOrderAlert, setNewOrderAlert] = useState<{ name: string; time: string; count: number } | null>(null)
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null)

  const prevPendingIdsRef = useRef<Set<string>>(new Set())
  const prevPaidIdsRef = useRef<Set<string>>(new Set())
  const isFirstLoadRef = useRef(true)
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)
  const paidAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)

  // Précharger et déverrouiller les sons au premier clic (politique autoplay navigateur)
  useEffect(() => {
    notificationAudioRef.current = new Audio('/sounds/notification.mp3')
    paidAudioRef.current = new Audio('/sounds/paid.mp3')
    notificationAudioRef.current.load()
    paidAudioRef.current.load()
    const unlock = () => {
      if (audioUnlockedRef.current) return
      const prime = (audio: HTMLAudioElement) => {
        audio.volume = 0
        audio.play().then(() => { audio.pause(); audio.currentTime = 0; audio.volume = 1 }).catch(() => {})
      }
      if (notificationAudioRef.current) prime(notificationAudioRef.current)
      if (paidAudioRef.current) prime(paidAudioRef.current)
      audioUnlockedRef.current = true
    }
    document.addEventListener('click', unlock, { once: true })
    return () => document.removeEventListener('click', unlock)
  }, [])

  const playSound = useCallback((type: 'new_order' | 'paid') => {
    try {
      const audio = type === 'new_order' ? notificationAudioRef.current : paidAudioRef.current
      if (!audio) return
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch { }
  }, [])

  // Persist sidebar collapse state
  useEffect(() => {
    const stored = localStorage.getItem('admin_sidebar_collapsed')
    if (stored === 'true') setIsSidebarCollapsed(true)
  }, [])

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('admin_sidebar_collapsed', String(next))
      return next
    })
  }, [])

  // Update sync age every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastSync) setSyncAge(Math.floor((Date.now() - lastSync.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [lastSync])

  const getAdminPin = () => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
  }

  const loadData = useCallback(async () => {
    const adminPin = getAdminPin()
    try {
      const res = await fetch('/api/admin/orders?filter=all', {
        headers: { 'x-admin-pin': adminPin },
        cache: 'no-store',
      })
      if (res.status === 401) {
        setIsAuthenticated(false)
        localStorage.removeItem('admin_auth')
        localStorage.removeItem('admin_pin')
        sessionStorage.removeItem('admin_pin')
        return
      }
      const text = await res.text()
      let data: Record<string, unknown> = {}
      try {
        data = JSON.parse(text) as Record<string, unknown>
      } catch {
        if (process.env.NODE_ENV === 'development') {
          console.error('[admin loadData] Réponse non-JSON:', text.slice(0, 200))
        }
      }

      if (!res.ok || !Array.isArray(data.orders)) {
        const msg =
          (typeof data.error === 'string' && data.error) ||
          (res.status === 403 ? 'Accès refusé. Rechargez la page.' : null) ||
          (res.status === 429 ? 'Trop de tentatives. Patientez quelques minutes.' : null) ||
          (res.status === 503 ? 'Admin non configuré côté serveur (PIN).' : null) ||
          `Impossible de charger les commandes (${res.status}).`
        setOrdersError(msg)
        if (isFirstLoadRef.current) {
          setOrders([])
          setStats(computeDashboardStats([]))
        }
        setLastSync(new Date())
        return
      }

      {
        const fetchedOrders = data.orders as Order[]

        // Detect pending_validation orders
        const pendingOrders = fetchedOrders.filter((o) => o.status === 'pending_validation')
        if (isFirstLoadRef.current) {
          // Premier chargement : afficher la bannière si des commandes attendent déjà (sans son)
          if (pendingOrders.length > 0) {
            setNewOrderAlert({
              name: pendingOrders[0].client_name,
              time: pendingOrders[0].heure_souhaitee,
              count: pendingOrders.length,
            })
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current)
            alertTimeoutRef.current = setTimeout(() => setNewOrderAlert(null), 12000)
          }
        } else {
          // Polls suivants : détecter les nouvelles commandes
          const newPending = pendingOrders.filter(
            (o) => !prevPendingIdsRef.current.has(o.id)
          )
          if (newPending.length > 0) {
            playSound('new_order')
            setNewOrderAlert({
              name: newPending[0].client_name,
              time: newPending[0].heure_souhaitee,
              count: newPending.length,
            })
            if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current)
            alertTimeoutRef.current = setTimeout(() => setNewOrderAlert(null), 8000)
          }
        }
        // Detect newly paid orders
        if (!isFirstLoadRef.current) {
          const newPaid = fetchedOrders.filter(
            (o) => o.status === 'paid' && !prevPaidIdsRef.current.has(o.id)
          )
          if (newPaid.length > 0) {
            playSound('paid')
          }
        }

        prevPendingIdsRef.current = new Set(
          fetchedOrders.filter((o) => o.status === 'pending_validation').map((o) => o.id)
        )
        prevPaidIdsRef.current = new Set(
          fetchedOrders.filter((o) => o.status === 'paid').map((o) => o.id)
        )
        isFirstLoadRef.current = false

        setOrders(fetchedOrders)
        setStats(computeDashboardStats(fetchedOrders))
        setOrdersError(data.databaseError ? 'Base de données en erreur' : null)
        setStatusChangeError(null)
        setLastSync(new Date())

        // Même clé que le panier / tests locaux : aligner sur Supabase pour éviter des « pending » fantômes
        // restés dans le navigateur quand l’API avait échoué silencieusement avant.
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('pdc_orders', JSON.stringify(fetchedOrders))
          }
        } catch {
          /* quota / private mode */
        }
        return
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[admin loadData]', e)
      }
      setOrdersError('Réseau indisponible ou erreur de chargement.')
      if (isFirstLoadRef.current) {
        setOrders([])
        setStats(computeDashboardStats([]))
      }
      setLastSync(new Date())
    }
  }, [playSound])

  const handleOrderStatusChange = useCallback(
    async (id: string, status: import('@/types/order').OrderStatus, data?: Partial<Order>) => {
      setStatusChangeError(null)
      const adminPin = getAdminPin()
      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin, 'x-csrf-token': getCsrfToken() },
          body: JSON.stringify({ status, ...data }),
        })
        if (res.status === 401) {
          setIsAuthenticated(false)
          localStorage.removeItem('admin_auth')
          localStorage.removeItem('admin_pin')
          sessionStorage.removeItem('admin_pin')
          return
        }
        if (res.ok) {
          await loadData()
          return
        }
        const errBody = await res.json().catch(() => ({}))
        const details = (errBody.details as string) || (errBody.error as string)
        if (res.status === 404) {
          // Commande supprimée directement en base → resynchroniser
          await loadData()
          return
        }
        const errMsg =
          res.status === 500 || res.status === 503
            ? details || 'Erreur serveur. Vérifiez Supabase (.env).'
            : res.status === 429
              ? 'Trop de tentatives. Réessayez dans quelques minutes.'
              : details || `Erreur ${res.status}`
        setOrders((prev) => {
          const next = prev.map((o) =>
            o.id === id ? { ...o, status, ...(data || {}) } : o
          )
          setStats(computeDashboardStats(next))
          return next
        })
        setStatusChangeError(errMsg)
        return
      } catch (_) {
        setOrders((prev) => {
          const next = prev.map((o) =>
            o.id === id ? { ...o, status, ...(data || {}) } : o
          )
          setStats(computeDashboardStats(next))
          return next
        })
        setStatusChangeError('Connexion impossible. Vérifiez le réseau puis réessayez.')
      }
    },
    [loadData]
  )

  const handleViewChange = useCallback((newView: ViewMode) => {
    setMountedViews((prev) => {
      if (prev.has(newView)) return prev
      const next = new Set(prev)
      next.add(newView)
      return next
    })
    setView(newView)
    if (['dashboard', 'orders', 'analytics', 'kitchen'].includes(newView)) {
      loadData()
    }
  }, [loadData])

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/me', {
        headers: { 'x-admin-pin': pin },
      })
      if (res.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_pin', pin)
        sessionStorage.setItem('admin_pin', pin)
      } else if (res.status === 429) {
        alert('Trop de tentatives. Réessayez dans quelques minutes.')
        setPin('')
      } else {
        alert('Code PIN incorrect')
        setPin('')
      }
    } catch {
      alert('Erreur de connexion. Réessayez.')
      setPin('')
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      const auth = localStorage.getItem('admin_auth')
      if (auth === 'true') {
        setIsAuthenticated(true)
      }
      return
    }
    if (typeof window !== 'undefined' && !sessionStorage.getItem('admin_pin')) {
      const storedPin = localStorage.getItem('admin_pin')
      if (storedPin) sessionStorage.setItem('admin_pin', storedPin)
    }
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated, loadData])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/20 md:p-10"
        >
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 text-coral ring-1 ring-coral/20"
              aria-hidden
            >
              <Pizza className="h-9 w-9" strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Espace administration
            </h1>
            <p className="mt-1 text-base text-slate-600">Pizza Dal Cielo</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="admin-pin"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Code PIN (4 à 12 chiffres)
              </label>
              <input
                id="admin-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className={cn(
                  'w-full min-h-[56px] rounded-2xl border-2 border-slate-200 px-4 py-4 text-center text-2xl tracking-[0.5em] text-slate-900 transition-all placeholder:text-slate-300 md:text-3xl',
                  'touch-manipulation',
                  adminFocusRing,
                  'focus:border-coral'
                )}
                placeholder="••••"
                minLength={4}
                maxLength={12}
                autoFocus
                autoComplete="one-time-code"
              />
              <p className="mt-2 text-center text-xs text-slate-500">
                En production : 6 chiffres minimum recommandé
              </p>
            </div>

            <button
              type="submit"
              className={cn(
                'w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-coral to-burnt-orange py-4 text-lg font-bold text-white shadow-lg shadow-coral/25 transition hover:brightness-[1.03] active:scale-[0.99]',
                adminFocusRing,
                'touch-manipulation'
              )}
            >
              Se connecter
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  const activeOrdersCount = orders.filter((o) =>
    ['pending_validation', 'paid', 'in_preparation'].includes(o.status)
  ).length

  const sidebarWidth = isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'

  const headerTitle: Record<ViewMode, string> = {
    dashboard: "Vue d'ensemble",
    orders: 'Gestion des Commandes',
    receipts: 'Reçus & bons de commande',
    stocks: 'Gestion des Stocks',
    kitchen: 'Mode Cuisine',
    analytics: 'Analyses',
    menu: 'Menu & Produits',
    announcement: 'Annonce',
    reviews: 'Avis clients',
  }

  return (
    <AdminToastProvider>
    <div className={cn(adminPageBg, 'min-h-screen min-h-[100dvh]')}>
      {/* Desktop Sidebar */}
      <AdminSidebar
        currentView={view}
        onChangeView={handleViewChange}
        onLogout={() => {
          setIsAuthenticated(false)
          localStorage.removeItem('admin_auth')
          localStorage.removeItem('admin_pin')
        }}
        ordersCount={activeOrdersCount}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      {/* Mobile Header (phones only; tablet uses sidebar) */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md md:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral ring-1 ring-coral/20">
            <Pizza className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <span className="truncate font-bold tracking-tight text-slate-900">Dal Cielo Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-slate-100 text-slate-700 touch-manipulation active:bg-slate-200',
            adminFocusRing
          )}
          aria-expanded={isMobileMenuOpen}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile scrim + menu (phones only) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-14 z-30 bg-slate-900/45 backdrop-blur-sm md:hidden"
              aria-label="Fermer le menu"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-14 z-40 max-h-[calc(100dvh-3.5rem)] space-y-2 overflow-y-auto overscroll-contain bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl md:hidden"
            >
            {[
              { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
              { id: 'orders', label: 'Commandes', icon: ShoppingBag, badge: activeOrdersCount },
              { id: 'receipts', label: 'Reçus', icon: FileText },
              { id: 'kitchen', label: 'Cuisine', icon: ChefHat },
              { id: 'menu', label: 'Menu & Produits', icon: UtensilsCrossed },
              { id: 'announcement', label: 'Annonce', icon: Megaphone },
              { id: 'reviews', label: 'Avis clients', icon: Star },
              { id: 'stocks', label: 'Stocks', icon: Package },
              { id: 'analytics', label: 'Analytics', icon: BarChart3Icon },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    handleViewChange(item.id as ViewMode)
                    setIsMobileMenuOpen(false)
                  }}
                  className={cn(
                    'flex min-h-[48px] w-full items-center justify-between rounded-xl border p-4 text-left font-medium touch-manipulation transition-colors',
                    view === item.id
                      ? 'border-coral/30 bg-coral text-white shadow-sm'
                      : 'border-slate-100 bg-slate-50 text-slate-800 active:bg-slate-100',
                    adminFocusRing
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {item.label}
                  </div>
                  {item.badge ? (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false)
                localStorage.removeItem('admin_auth')
                localStorage.removeItem('admin_pin')
              }}
              className="mt-4 flex min-h-[48px] w-full items-center gap-3 rounded-xl bg-red-50 p-4 font-medium text-red-700 touch-manipulation active:bg-red-100"
            >
              <LogOut size={20} />
              Déconnexion
            </button>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`${sidebarWidth} p-4 md:p-6 lg:p-8 transition-all duration-300 min-h-screen pb-8 overflow-x-hidden`}
      >
        {/* Titre de page sur mobile (iPad/desktop l'ont dans la sidebar + header) */}
        <div className="md:hidden mb-4">
          <h2 className="text-xl font-bold text-slate-900">{headerTitle[view]}</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {statusChangeError && (
          <div className="mb-4 md:mb-0 md:absolute md:top-4 md:left-4 md:right-4 z-10 md:max-w-2xl md:mx-auto bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium flex flex-wrap items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span className="flex-1">{statusChangeError}</span>
            <button
              type="button"
              onClick={() => { setStatusChangeError(null); loadData() }}
              className="text-amber-700 underline font-semibold"
            >
              Rafraîchir
            </button>
          </div>
        )}
        <div className="max-w-7xl mx-auto">
          {/* Page header (tablet + desktop) */}
          <div className="mb-6 hidden items-center justify-between gap-4 md:flex lg:mb-8">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                {headerTitle[view]}
              </h2>
              <p className="mt-1 font-medium capitalize text-slate-500">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              {lastSync && (
                <div
                  className={cn(
                    adminToolbarChip,
                    'text-slate-500'
                  )}
                >
                  <RefreshCw size={14} className="shrink-0 text-emerald-600" aria-hidden />
                  <span>Mis à jour il y a {syncAge}s</span>
                </div>
              )}
              {ordersError && (
                <div className="flex max-w-xs items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  <AlertCircle size={14} className="shrink-0" aria-hidden />
                  <span className="truncate">{ordersError}</span>
                </div>
              )}
              <div
                className={cn(
                  adminToolbarChip,
                  'border-emerald-100 bg-emerald-50/80 text-emerald-900'
                )}
              >
                <span
                  className="relative flex h-2.5 w-2.5 shrink-0"
                  aria-hidden
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]" />
                </span>
                <span className="text-sm font-semibold">En ligne</span>
              </div>
            </div>
          </div>

          <div>
            {/* Sections avec data fetching propre — lazy-mount, gardées en mémoire */}
            {mountedViews.has('menu') && (
              <div className={view !== 'menu' ? 'hidden' : ''}><MenuManager /></div>
            )}
            {mountedViews.has('announcement') && (
              <div className={view !== 'announcement' ? 'hidden' : ''}><AnnouncementEditor /></div>
            )}
            {mountedViews.has('reviews') && (
              <div className={view !== 'reviews' ? 'hidden' : ''}><ReviewsManager /></div>
            )}
            {mountedViews.has('stocks') && (
              <div className={view !== 'stocks' ? 'hidden' : ''}><StocksManager /></div>
            )}

            {/* Sections dépendant des données parent — remontées sur chaque visite */}
            {view === 'dashboard' && (
              <DashboardView orders={orders} stats={stats} adminPin={getAdminPin()} />
            )}
            {view === 'orders' && (
              <OrdersList
                orders={orders}
                onRefresh={loadData}
                onStatusChange={handleOrderStatusChange}
              />
            )}
            {view === 'receipts' && (
              <ReceiptsManager orders={orders} adminPin={getAdminPin()} onRefresh={loadData} />
            )}
            {view === 'analytics' && <AnalyticsView orders={orders} stats={stats} />}
            {view === 'kitchen' && (
              <KitchenMode
                orders={orders.filter((o) => ['paid', 'in_preparation'].includes(o.status))}
                onStatusChange={handleOrderStatusChange}
              />
            )}
          </div>
        </div>
      </main>

      {/* Toast — nouvelle commande (CieloBot ou site) */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            className="fixed bottom-6 right-4 z-50 w-[min(100vw-2rem,320px)] rounded-2xl border border-white/10 bg-gradient-to-br from-coral to-burnt-orange p-4 text-white shadow-2xl shadow-coral/30 md:bottom-auto md:right-6 md:top-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <Pizza className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-snug">
                  {newOrderAlert.count > 1
                    ? `${newOrderAlert.count} nouvelles commandes !`
                    : 'Nouvelle commande !'}
                </p>
                <p className="text-white/80 text-xs mt-0.5 truncate">
                  {newOrderAlert.name} — {newOrderAlert.time}
                </p>
              </div>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={() => {
                handleViewChange('orders')
                setNewOrderAlert(null)
              }}
              className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              Voir les commandes →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AdminToastProvider>
  )
}

function DashboardView({
  orders,
  stats,
  adminPin,
}: {
  orders: Order[]
  stats: DashboardStats
  adminPin: string
}) {
  const { estimate } = useQueueEstimate(true)
  const [queueMode, setQueueMode] = useState<'auto' | 'manual'>('auto')
  const [manualMinutes, setManualMinutes] = useState(estimate.estimatedMinutes)
  const [ovenAvailable, setOvenAvailable] = useState(true)
  const [savingOven, setSavingOven] = useState(false)
  const [loadingQueueSettings, setLoadingQueueSettings] = useState(true)
  const [savingQueueSettings, setSavingQueueSettings] = useState(false)
  const [queueSettingsNotice, setQueueSettingsNotice] = useState<string | null>(null)
  const [sliderEnabled, setSliderEnabled] = useState(true)
  const [dessertsEnabled, setDessertsEnabled] = useState(false)
  const [loadingHomepageSettings, setLoadingHomepageSettings] = useState(true)
  const [savingHomepageSettings, setSavingHomepageSettings] = useState(false)
  const [savingDesserts, setSavingDesserts] = useState(false)
  const [homepageSettingsNotice, setHomepageSettingsNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadQueueSettings = async () => {
      setLoadingQueueSettings(true)
      try {
        const res = await fetch('/api/admin/queue-settings', {
          headers: { 'x-admin-pin': adminPin },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.settings) return
        if (cancelled) return
        setQueueMode(data.settings.mode === 'manual' ? 'manual' : 'auto')
        setOvenAvailable(Boolean(data.settings.ovenAvailable))
        setManualMinutes(
          typeof data.settings.manualEstimatedMinutes === 'number'
            ? data.settings.manualEstimatedMinutes
            : 15
        )
      } catch {
        if (!cancelled) setQueueSettingsNotice("Impossible de charger les réglages du four.")
      } finally {
        if (!cancelled) setLoadingQueueSettings(false)
      }
    }

    if (adminPin) loadQueueSettings()
    return () => {
      cancelled = true
    }
  }, [adminPin])

  useEffect(() => {
    let cancelled = false
    const loadHomepageSettings = async () => {
      setLoadingHomepageSettings(true)
      try {
        const res = await fetch('/api/admin/homepage-settings', {
          headers: { 'x-admin-pin': adminPin },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.settings) return
        if (cancelled) return
        setSliderEnabled(Boolean(data.settings.sliderEnabled))
        setDessertsEnabled(Boolean(data.settings.dessertsEnabled))
      } catch {
        if (!cancelled) setHomepageSettingsNotice('Impossible de charger les réglages.')
      } finally {
        if (!cancelled) setLoadingHomepageSettings(false)
      }
    }
    if (adminPin) loadHomepageSettings()
    return () => { cancelled = true }
  }, [adminPin])

  const saveHomepageSlider = async (enabled: boolean) => {
    setSavingHomepageSettings(true)
    setHomepageSettingsNotice(null)
    try {
      const res = await fetch('/api/admin/homepage-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin, 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify({ sliderEnabled: enabled }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setHomepageSettingsNotice((data?.error as string) || 'Échec de mise à jour.')
        return
      }
      setSliderEnabled(Boolean(data?.settings?.sliderEnabled))
      setHomepageSettingsNotice('Réglage enregistré. Page d\'accueil mise à jour.')
    } catch {
      setHomepageSettingsNotice('Erreur réseau, réessayez.')
    } finally {
      setSavingHomepageSettings(false)
    }
  }

  const saveDessertsToggle = async (enabled: boolean) => {
    setSavingDesserts(true)
    setHomepageSettingsNotice(null)
    try {
      const res = await fetch('/api/admin/homepage-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin, 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify({ dessertsEnabled: enabled }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setHomepageSettingsNotice((data?.error as string) || 'Échec de mise à jour.')
        return
      }
      setDessertsEnabled(Boolean(data?.settings?.dessertsEnabled))
      setHomepageSettingsNotice(enabled ? 'Desserts activés sur le menu.' : 'Desserts masqués sur le menu.')
    } catch {
      setHomepageSettingsNotice('Erreur réseau, réessayez.')
    } finally {
      setSavingDesserts(false)
    }
  }

  // Toggle four avec sauvegarde immédiate (sans attendre "Enregistrer")
  const autoSaveOven = async () => {
    const next = !ovenAvailable
    setOvenAvailable(next) // optimiste
    setSavingOven(true)
    try {
      const res = await fetch('/api/admin/queue-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin, 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify({ ovenAvailable: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setOvenAvailable(!next) // rollback si erreur
      setQueueSettingsNotice('Erreur lors de la sauvegarde du statut du four.')
    } finally {
      setSavingOven(false)
    }
  }

  const saveQueueSettings = async () => {
    setSavingQueueSettings(true)
    setQueueSettingsNotice(null)
    try {
      const payload = {
        mode: queueMode,
        ovenAvailable,
        manualEstimatedMinutes: queueMode === 'manual' ? manualMinutes : null,
      }
      const res = await fetch('/api/admin/queue-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
          'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setQueueSettingsNotice((data?.error as string) || 'Échec de mise à jour.')
        return
      }
      setQueueSettingsNotice('Réglages enregistrés. Homepage mise à jour.')
    } catch {
      setQueueSettingsNotice('Erreur réseau, réessayez.')
    } finally {
      setSavingQueueSettings(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => exportOrdersToCSV(orders)}
          className={cn(
            adminBtnSecondary,
            'gap-2 px-4 py-2.5 text-sm shadow-sm',
            adminFocusRing
          )}
        >
          <Download size={16} aria-hidden />
          Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <KPICard
          title="CA du jour"
          value={`${stats.today_revenue.toFixed(2)}€`}
          trend={{ value: 15, label: 'vs hier' }}
          icon={DollarSign}
          color="green"
        />
        <KPICard title="Commandes payées" value={stats.today_orders} icon={ShoppingBag} color="blue" />
        <KPICard title="À traiter" value={stats.active_orders} icon={ChefHat} color="orange" />
        <KPICard
          title="Temps moyen"
          value={`${stats.avg_preparation_time} min`}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Page d'accueil — slider pizzas */}
      <AdminCard>
        <AdminSectionHeader
          label="Page d'accueil"
          title="Slider des pizzas"
          icon={Home}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => saveHomepageSlider(!sliderEnabled)}
            disabled={loadingHomepageSettings || savingHomepageSettings}
            className={cn(
              'min-h-[44px] rounded-xl border px-5 text-sm font-semibold transition-colors disabled:opacity-60',
              sliderEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-100 text-slate-700',
              adminFocusRing
            )}
          >
            {savingHomepageSettings ? 'Enregistrement...' : sliderEnabled ? 'Slider activé' : 'Slider désactivé'}
          </button>
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-600">
            {sliderEnabled ? 'Le carousel des pizzas s\'affiche sur la page d\'accueil.' : 'Le carousel est masqué sur la page d\'accueil.'}
          </p>
          {homepageSettingsNotice && (
            <p className="w-full text-sm font-medium text-slate-700">{homepageSettingsNotice}</p>
          )}
        </div>
      </AdminCard>

      {/* Section Desserts */}
      <AdminCard>
        <AdminSectionHeader
          label="Carte du menu"
          title="Section desserts"
          icon={IceCream}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => saveDessertsToggle(!dessertsEnabled)}
            disabled={loadingHomepageSettings || savingDesserts}
            className={cn(
              'min-h-[44px] rounded-xl border px-5 text-sm font-semibold transition-colors disabled:opacity-60',
              dessertsEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-100 text-slate-700',
              adminFocusRing
            )}
          >
            {savingDesserts ? 'Enregistrement...' : dessertsEnabled ? 'Desserts activés' : 'Desserts masqués'}
          </button>
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-600">
            {dessertsEnabled
              ? 'La section desserts est visible sur le menu. Gérez les articles dans Menu & Produits.'
              : 'La section desserts est masquée. Activez-la une fois les articles ajoutés dans Menu & Produits.'}
          </p>
        </div>
      </AdminCard>

      <AdminCard>
        <AdminSectionHeader
          label="Pilotage four & attente"
          title="Contrôle manuel"
          icon={SlidersHorizontal}
          action={
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
              Actuel public :{' '}
              {!estimate.ovenAvailable
                ? 'Four indisponible'
                : `~${estimate.estimatedMinutes} min (${estimate.estimateSource === 'manual' ? 'manuel' : 'auto'})`}
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
            <p className={cn(adminSectionLabel, 'mb-3')}>
              Disponibilité du four
            </p>
            <button
              type="button"
              onClick={autoSaveOven}
              disabled={loadingQueueSettings || savingOven}
              className={cn(
                'flex min-h-[44px] w-full items-center justify-center rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60',
                ovenAvailable
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-800',
                adminFocusRing
              )}
            >
              <span className="inline-flex items-center gap-2">
                {savingOven
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Power size={14} />
                }
                {savingOven ? 'Enregistrement...' : ovenAvailable ? 'Four disponible' : 'Four indisponible'}
              </span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 md:col-span-1">
            <p className={cn(adminSectionLabel, 'mb-3')}>
              Source du temps d&apos;attente
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQueueMode('auto')}
                disabled={loadingQueueSettings || savingQueueSettings}
                className={cn(
                  'min-h-[44px] rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60',
                  queueMode === 'auto'
                    ? 'border-blue-200 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-700',
                  adminFocusRing
                )}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setQueueMode('manual')}
                disabled={loadingQueueSettings || savingQueueSettings}
                className={cn(
                  'min-h-[44px] rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60',
                  queueMode === 'manual'
                    ? 'border-coral/40 bg-coral/10 text-coral'
                    : 'border-slate-200 bg-white text-slate-700',
                  adminFocusRing
                )}
              >
                Manuel
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 md:col-span-1">
            <p className={cn(adminSectionLabel, 'mb-3')}>
              Temps manuel (minutes)
            </p>
            <input
              type="number"
              min={5}
              max={180}
              value={manualMinutes}
              onChange={(e) => setManualMinutes(Math.max(5, Math.min(180, Number(e.target.value) || 5)))}
              disabled={queueMode !== 'manual' || loadingQueueSettings || savingQueueSettings}
              className={cn(
                'min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-semibold text-slate-900',
                adminFocusRing,
                'focus:border-coral'
              )}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveQueueSettings}
            disabled={loadingQueueSettings || savingQueueSettings}
            className={cn(
              'min-h-[44px] rounded-xl bg-gradient-to-r from-coral to-burnt-orange px-5 text-sm font-bold text-white shadow-sm transition hover:brightness-[1.03] disabled:opacity-50',
              adminFocusRing
            )}
          >
            {savingQueueSettings ? 'Enregistrement...' : 'Enregistrer les réglages'}
          </button>
          {queueSettingsNotice && (
            <p className="text-sm font-medium text-slate-600">{queueSettingsNotice}</p>
          )}
        </div>
      </AdminCard>

      {/* Bannière file d'attente four */}
      <div
        className={cn(
          'flex items-center gap-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm',
          !estimate.ovenAvailable
            ? 'border-l-4 border-l-red-500'
            : estimate.totalItems === 0
              ? 'border-l-4 border-l-emerald-500'
              : estimate.estimatedMinutes <= 20
                ? 'border-l-4 border-l-emerald-500'
                : estimate.estimatedMinutes <= 40
                  ? 'border-l-4 border-l-orange-500'
                  : 'border-l-4 border-l-red-500'
        )}
      >
        <div className="flex-1 py-4 pl-5">
          <div className="flex items-center gap-3 mb-1">
            <div
              className={`p-1.5 rounded-lg ${
                !estimate.ovenAvailable
                  ? 'bg-red-100 text-red-600'
                  : estimate.totalItems === 0
                  ? 'bg-emerald-100 text-emerald-600'
                  : estimate.estimatedMinutes <= 20
                  ? 'bg-emerald-100 text-emerald-600'
                  : estimate.estimatedMinutes <= 40
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              <Flame size={18} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              {!estimate.ovenAvailable
                ? 'Four indisponible'
                : estimate.totalItems === 0
                ? 'Le four est libre'
                : 'File d\'attente en cuisine'}
            </h3>
          </div>
          
          <p className="text-slate-500 text-sm font-medium ml-1">
            {!estimate.ovenAvailable
              ? "L'équipe de Dal Cielo a temporairement désactivé le four. Le délai affiché est indicatif."
              : estimate.totalItems === 0
              ? 'Aucune commande en attente de cuisson.'
              : `${estimate.totalItems} pizza${estimate.totalItems > 1 ? 's' : ''} à préparer · ${estimate.activeOrders} commande${estimate.activeOrders > 1 ? 's' : ''} en cours`}
          </p>
        </div>

        <div className={`px-8 py-4 border-l border-slate-100 flex flex-col items-center justify-center min-w-[140px] ${
            !estimate.ovenAvailable
              ? 'bg-red-50/40'
              : estimate.totalItems === 0
                ? 'bg-emerald-50/30'
                : ''
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Attente estimée</span>
          <span
            className={`text-2xl font-black ${
              !estimate.ovenAvailable
                ? 'text-red-600'
                : estimate.totalItems === 0
                ? 'text-emerald-600'
                : estimate.estimatedMinutes <= 20
                ? 'text-emerald-600'
                : estimate.estimatedMinutes <= 40
                ? 'text-orange-600'
                : 'text-red-600'
            }`}
          >
            ~{estimate.estimatedMinutes} min
          </span>
        </div>
      </div>

      <StockAlerts />

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <RevenueChart orders={orders} />
        <TopPizzas data={stats.top_pizzas} />
      </div>
    </div>
  )
}

function AnalyticsView({ orders, stats }: { orders: Order[]; stats: DashboardStats | null }) {
  // Last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const revenueByDay = last7Days.map((d) => {
    const dayStr = d.toDateString()
    const dayOrders = orders.filter(
      (o) =>
        new Date(o.created_at).toDateString() === dayStr &&
        ['paid', 'in_preparation', 'ready', 'in_delivery', 'completed'].includes(o.status)
    )
    return {
      label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      revenue: parseFloat(dayOrders.reduce((s, o) => s + o.total, 0).toFixed(2)),
      orders: dayOrders.length,
    }
  })

  const revenue7d = revenueByDay.reduce((s, d) => s + d.revenue, 0)
  const orders7d = revenueByDay.reduce((s, d) => s + d.orders, 0)

  // Validation rate last 7 days
  const cutoff7d = new Date()
  cutoff7d.setDate(cutoff7d.getDate() - 7)
  const ordersLast7d = orders.filter((o) => new Date(o.created_at) >= cutoff7d)
  const validationRate7d =
    ordersLast7d.length > 0
      ? Math.round(
          (ordersLast7d.filter((o) => o.status !== 'refused').length / ordersLast7d.length) * 100
        )
      : 100

  // Top pizzas all-time
  const pizzaCount: Record<string, number> = {}
  orders
    .filter((o) =>
      ['paid', 'in_preparation', 'ready', 'in_delivery', 'completed'].includes(o.status)
    )
    .forEach((o) => {
      o.items.forEach((item) => {
        if (
          ['Pizzas', 'Classique', 'Du Chef'].includes(item.category)
        ) {
          pizzaCount[item.name] = (pizzaCount[item.name] || 0) + item.quantity
        }
      })
    })
  const topPizzasAllTime = Object.entries(pizzaCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Status distribution
  const statusDist = {
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    refused: orders.filter((o) => o.status === 'refused').length,
  }
  const totalTerminal = statusDist.completed + statusDist.cancelled + statusDist.refused

  return (
    <div className="space-y-6 md:space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="CA 7 jours"
          value={`${revenue7d.toFixed(2)}€`}
          icon={DollarSign}
          color="green"
        />
        <KPICard title="Commandes 7j" value={orders7d} icon={ShoppingBag} color="blue" />
        <KPICard
          title="Taux validation"
          value={`${validationRate7d}%`}
          icon={TrendingUp}
          color="purple"
        />
        <KPICard
          title="Temps moyen"
          value={`${stats?.avg_preparation_time ?? 0} min`}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {/* CA 7 derniers jours */}
        <AdminCard>
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
            <BarChart3Icon className="h-5 w-5 text-coral" aria-hidden />
            CA 7 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#94a3b8" 
                style={{ fontSize: '11px', fontWeight: 500 }} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '11px', fontWeight: 500 }}
                tickFormatter={(v) => `${v}€`}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                formatter={(v: unknown) => [<span className="font-bold text-orange-600">{String(v)}€</span>, 'CA']}
                contentStyle={{ 
                  borderRadius: 12, 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '10px 14px'
                }}
              />
              <Bar dataKey="revenue" fill="#E17B5F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AdminCard>

        {/* Commandes 7 derniers jours */}
        <AdminCard>
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
            <LineChartIcon className="h-5 w-5 text-coral" aria-hidden />
            Commandes 7 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#94a3b8" 
                style={{ fontSize: '11px', fontWeight: 500 }} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                style={{ fontSize: '11px', fontWeight: 500 }} 
                allowDecimals={false} 
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                formatter={(v: unknown) => [<span className="font-bold text-blue-600">{String(v)}</span>, 'Commandes']}
                contentStyle={{ 
                  borderRadius: 12, 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '10px 14px'
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AdminCard>
      </div>

      {/* Today's hourly revenue */}
      <RevenueChart orders={orders} />

      {/* Top pizzas + status distribution */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {/* Top pizzas all-time */}
        <AdminCard>
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
            <TrendingUp size={20} className="text-coral" aria-hidden />
            Top pizzas (tous temps)
          </h3>
          {topPizzasAllTime.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Package size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="space-y-5">
              {topPizzasAllTime.map((pizza, i) => {
                const maxCount = topPizzasAllTime[0].count
                return (
                  <div key={pizza.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 tabular-nums">
                          {i + 1}
                        </span>
                        <span className="font-medium text-slate-700 text-sm">
                          {pizza.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-coral">{pizza.count}</span>
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden pl-10">
                      <div
                        className="h-full rounded-full bg-coral transition-all duration-500 group-hover:bg-burnt-orange"
                        style={{ width: `${(pizza.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </AdminCard>

        {/* Status distribution */}
        <AdminCard>
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
            <PieChart className="h-5 w-5 text-coral" aria-hidden />
            Distribution des statuts
          </h3>
          {totalTerminal === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Clock size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Aucune commande terminée</p>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { label: 'Terminées', count: statusDist.completed, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'Annulées', count: statusDist.cancelled, color: 'bg-rose-400', text: 'text-rose-700', bg: 'bg-rose-50' },
                { label: 'Refusées', count: statusDist.refused, color: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">{s.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-slate-900">{s.count}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        ({totalTerminal > 0 ? Math.round((s.count / totalTerminal) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all duration-500`}
                      style={{
                        width:
                          totalTerminal > 0
                            ? `${(s.count / totalTerminal) * 100}%`
                            : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Total traité</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{totalTerminal}</span>
              </div>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  )
}
