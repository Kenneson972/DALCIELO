'use client'

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ChefHat,
  BarChart3,
  UtensilsCrossed,
  Megaphone,
  Star,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pizza,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminFocusRingDark } from '@/components/admin/adminUi'

type ViewMode = 'dashboard' | 'orders' | 'receipts' | 'stocks' | 'analytics' | 'kitchen' | 'menu' | 'announcement' | 'reviews'

interface AdminSidebarProps {
  currentView: ViewMode
  onChangeView: (view: ViewMode) => void
  onLogout: () => void
  ordersCount: number
  isCollapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({
  currentView,
  onChangeView,
  onLogout,
  ordersCount,
  isCollapsed,
  onToggle,
}: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag, badge: ordersCount },
    { id: 'receipts', label: 'Reçus', icon: FileText },
    { id: 'kitchen', label: 'Cuisine', icon: ChefHat },
    { id: 'menu', label: 'Menu & Produits', icon: UtensilsCrossed },
    { id: 'announcement', label: 'Annonce', icon: Megaphone },
    { id: 'reviews', label: 'Avis clients', icon: Star },
    { id: 'stocks', label: 'Stocks', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-slate-800/80 bg-slate-900 shadow-xl transition-all duration-300 md:flex',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-[4.5rem] shrink-0 items-center justify-center border-b border-slate-800/80 px-3">
        <div className="flex w-full items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral ring-1 ring-coral/25"
            aria-hidden
          >
            <Pizza className="h-6 w-6" strokeWidth={2} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-white">
                Dal Cielo
              </h1>
              <p className="text-xs font-medium text-slate-400">Administration</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
        {menuItems.map((item) => {
          const isActive = currentView === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id as ViewMode)}
              className={cn(
                'group relative flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 touch-manipulation',
                adminFocusRingDark,
                isActive
                  ? 'bg-coral/15 text-white shadow-inner ring-1 ring-coral/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <div
                className={cn(
                  'flex min-w-0 items-center',
                  isCollapsed ? 'justify-center' : 'gap-3'
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-coral' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      'truncate text-sm font-medium',
                      isActive && 'font-semibold text-white'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </div>
              {!isCollapsed && item.badge ? (
                <span
                  className={cn(
                    'ml-auto rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums',
                    isActive
                      ? 'bg-coral/25 text-coral'
                      : 'bg-slate-800 text-slate-300'
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
              {isCollapsed && item.badge ? (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-slate-900 bg-coral" />
              ) : null}
              {/* Tooltip visible uniquement en mode réduit */}
              {isCollapsed && (
                <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                  {item.label}
                  {item.badge ? <span className="ml-1.5 rounded-md bg-coral/30 px-1.5 py-0.5 text-[10px] text-coral">{item.badge}</span> : null}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-slate-800/80 p-3">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            'group relative flex w-full min-h-[44px] items-center rounded-xl px-3 py-2.5 text-slate-400 transition-colors hover:bg-red-950/40 hover:text-red-300 touch-manipulation',
            isCollapsed ? 'justify-center' : 'gap-3',
            adminFocusRingDark
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Déconnexion</span>}
          {isCollapsed && (
            <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              Déconnexion
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex w-full min-h-[44px] items-center justify-center rounded-xl py-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 touch-manipulation',
            adminFocusRingDark
          )}
          aria-label={isCollapsed ? 'Ouvrir la barre latérale' : 'Réduire la barre latérale'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}
