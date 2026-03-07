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
} from 'lucide-react'

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
      className={`fixed inset-y-0 left-0 bg-white border-r border-slate-100 hidden md:flex flex-col z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-20 flex items-center justify-center border-b border-slate-50 shrink-0 px-4">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl shrink-0 text-orange-500">
            🍕
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 text-lg leading-tight truncate">
                Dal Cielo
              </h1>
              <p className="text-xs text-slate-400 font-medium">Administration</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = currentView === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewMode)}
              title={isCollapsed ? item.label : undefined}
              className={`
                relative w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-3 py-3 min-h-[44px] rounded-xl transition-all duration-200 group touch-manipulation
                ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'} min-w-0`}>
                <Icon
                  size={20}
                  className={`shrink-0 transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {!isCollapsed && (
                  <span className={`text-sm font-medium truncate ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                )}
              </div>
              {!isCollapsed && item.badge ? (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-white text-orange-600 shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
              {isCollapsed && item.badge ? (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-50 shrink-0 space-y-2">
        <button
          onClick={onLogout}
          title={isCollapsed ? 'Déconnexion' : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 min-h-[44px] rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors touch-manipulation`}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Déconnexion</span>}
        </button>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center min-h-[44px] py-2 text-slate-300 hover:text-slate-500 transition-colors touch-manipulation"
          aria-label={isCollapsed ? 'Ouvrir la barre latérale' : 'Réduire la barre latérale'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
