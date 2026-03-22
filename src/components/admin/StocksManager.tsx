'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Minus,
  Package,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Pizza,
  CupSoda,
  Cookie,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminCard, adminFocusRing } from '@/components/admin/adminUi'
import type { Stock } from '@/lib/stocksStore'
import { menuData } from '@/data/menuData'
import { getCsrfToken } from '@/lib/csrf'

function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
}

// Helper to find menu item info
function getMenuInfo(itemId: string) {
  const allItems = [
    ...menuData.pizzas,
    ...menuData.friands,
    ...menuData.drinks,
  ]
  // @ts-ignore
  const match = allItems.find(i => String(i.id) === itemId)
  return match
}

export function StocksManager() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newItem, setNewItem] = useState({ item_id: '', name: '', category: 'Pizzas', quantity: 20, min_threshold: 5, unit: 'unité' })

  const loadStocks = useCallback(async () => {
    const pin = getAdminPin()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/stocks', { headers: { 'x-admin-pin': pin } })
      const data = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(data.stocks)) {
        setStocks(data.stocks)
        return
      }
      if (res.status === 401) setError('Session expirée. Reconnectez-vous.')
      else setError(data.message || 'Impossible de charger les stocks.')
      setStocks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStocks()
    const interval = setInterval(loadStocks, 15000)
    return () => clearInterval(interval)
  }, [loadStocks])

  const handleSeed = async () => {
    const pin = getAdminPin()
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/stocks/seed', { method: 'POST', headers: { 'x-admin-pin': pin, 'x-csrf-token': getCsrfToken() } })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        await loadStocks()
        alert(data.message || 'Synchronisation réussie')
      } else {
        setError(data.error || 'Erreur lors de l\'initialisation')
      }
    } finally {
      setSeeding(false)
    }
  }

  const handleAdjust = async (item_id: string, delta: number) => {
    const pin = getAdminPin()
    // Optimistic update
    setStocks(prev => prev.map(s => {
      if (s.item_id === item_id) {
        const newQ = Math.max(0, s.quantity + delta)
        return { ...s, quantity: newQ }
      }
      return s
    }))

    try {
      const res = await fetch(`/api/admin/stocks/${encodeURIComponent(item_id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin, 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify({ adjust: delta }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.stock) {
        setStocks((prev) => prev.map((s) => (s.item_id === item_id ? data.stock : s)))
      } else {
        // Revert on error (could be improved)
        loadStocks()
      }
    } catch (_) {
      loadStocks()
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const pin = getAdminPin()
    const item_id = newItem.item_id.trim() || `custom-${Date.now()}`
    try {
      const res = await fetch('/api/admin/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin, 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify({
          item_id,
          name: newItem.name.trim(),
          category: newItem.category.trim(),
          quantity: newItem.quantity,
          min_threshold: newItem.min_threshold,
          unit: newItem.unit,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        await loadStocks()
        setShowCreate(false)
        setNewItem({ item_id: '', name: '', category: 'Pizzas', quantity: 20, min_threshold: 5, unit: 'unité' })
      } else setError(data.error || 'Erreur création')
    } catch (_) {
      setError('Erreur réseau')
    }
  }

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pizzas : une seule catégorie "Pizzas" (Classique + Pizza du Chef)
  const PIZZA_CATEGORIES = ['Classique', 'Du Chef', 'Pizzas']
  const getDisplayCategory = (category: string) =>
    PIZZA_CATEGORIES.includes(category) ? 'Pizzas' : (category || 'Autres')

  const groupedStocks = filteredStocks.reduce((acc, stock) => {
    const cat = getDisplayCategory(stock.category)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(stock)
    return acc
  }, {} as Record<string, Stock[]>)

  const categoriesOrder = ['Pizzas', 'Friands', 'Boissons', 'Autres']
  const sortedCategories = Object.keys(groupedStocks).sort(
    (a, b) => {
      const idxA = categoriesOrder.indexOf(a)
      const idxB = categoriesOrder.indexOf(b)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.localeCompare(b)
    }
  )

  if (loading && stocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-coral" aria-label="Chargement" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:space-y-8">
      {/* Header Actions */}
      <div
        className={cn(
          adminCard,
          'flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6'
        )}
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Gestion des stocks
          </h2>
          <p className="mt-1 text-sm text-slate-600">Disponibilité des pizzas et boissons</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
              aria-hidden
            />
            <input
              type="text"
              placeholder="Rechercher…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400',
                adminFocusRing,
                'focus:border-coral'
              )}
            />
          </div>

          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className={cn(
              'inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-100 px-4 font-semibold text-slate-800 transition-colors hover:bg-slate-200 disabled:opacity-50 sm:px-5',
              adminFocusRing
            )}
          >
            <RefreshCw size={18} className={seeding ? 'animate-spin' : ''} aria-hidden />
            {seeding ? 'Sync…' : 'Sync menu'}
          </button>

          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className={cn(
              'inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-coral to-burnt-orange px-4 font-semibold text-white shadow-md shadow-coral/20 transition hover:brightness-[1.03] sm:px-5',
              adminFocusRing
            )}
          >
            <Plus size={18} aria-hidden /> Nouvel article
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 flex items-center gap-3">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className={cn(
            adminCard,
            'space-y-4 border-slate-200 shadow-md animate-in fade-in slide-in-from-top-4'
          )}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-900">Créer un article manuel</h3>
            <button type="button" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
              <XCircle size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID (optionnel)</label>
              <input
                type="text"
                value={newItem.item_id}
                onChange={(e) => setNewItem((p) => ({ ...p, item_id: e.target.value }))}
                placeholder="ex: 501"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex: Ti-punch"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catégorie *</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
              >
                {categoriesOrder.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantité</label>
                <input
                  type="number"
                  min={0}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((p) => ({ ...p, quantity: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seuil</label>
                <input
                  type="number"
                  min={0}
                  value={newItem.min_threshold}
                  onChange={(e) => setNewItem((p) => ({ ...p, min_threshold: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">
              Annuler
            </button>
            <button type="submit" className="bg-coral text-white px-6 py-2 rounded-lg font-bold hover:bg-burnt-orange shadow-lg shadow-coral/20">
              Créer l'article
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {stocks.length === 0 && !showCreate && (
        <div className={cn(adminCard, 'p-10 text-center md:p-12')}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Package className="text-slate-400" size={32} aria-hidden />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun stock</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Votre inventaire est vide. Synchronisez avec le menu pour ajouter automatiquement toutes les pizzas et boissons.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-coral text-white px-6 py-3 rounded-xl font-bold hover:bg-burnt-orange shadow-lg shadow-coral/25 transition-all hover:scale-105"
          >
            {seeding ? 'Synchronisation...' : 'Synchroniser avec le Menu'}
          </button>
        </div>
      )}

      {/* Stock Categories */}
      {sortedCategories.map((category) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/10 text-coral ring-1 ring-coral/15">
              {category === 'Pizzas' ? (
                <Pizza size={20} aria-hidden />
              ) : category === 'Boissons' ? (
                <CupSoda size={20} aria-hidden />
              ) : category === 'Friands' ? (
                <Cookie size={20} aria-hidden />
              ) : (
                <Package size={20} aria-hidden />
              )}
            </span>
            <h3 className="text-xl font-bold text-slate-800">{category}</h3>
            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {groupedStocks[category].length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {groupedStocks[category].map((stock) => {
              const menuInfo = getMenuInfo(stock.item_id)
              const isLow = stock.quantity <= stock.min_threshold
              const isOut = stock.quantity === 0
              
              return (
                <div 
                  key={stock.item_id} 
                  className={`
                    group bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                    ${isOut ? 'border-red-200 shadow-none opacity-90' : 'border-slate-100 shadow-sm hover:shadow-md hover:border-coral/30'}
                  `}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight mb-1 group-hover:text-coral transition-colors">{stock.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">ID: {stock.item_id}</p>
                      </div>
                      <div className={`
                        px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5
                        ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}
                      `}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'}`} />
                        {isOut ? 'Épuisé' : isLow ? 'Faible' : 'En stock'}
                      </div>
                    </div>

                    {menuInfo && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 min-h-[2.5em]">
                        {/* @ts-ignore */}
                        {(menuInfo as any).description || (menuInfo as any).ingredients?.join(', ') || 'Aucune description'}
                      </p>
                    )}

                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-100 gap-2">
                      <button
                        onClick={() => handleAdjust(stock.item_id, -1)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50 touch-manipulation"
                        disabled={stock.quantity <= 0}
                        aria-label="Diminuer"
                      >
                        <Minus size={20} />
                      </button>
                      
                      <div className="flex flex-col items-center min-w-[3rem]">
                        <span className={`text-xl font-bold ${isOut ? 'text-red-500' : 'text-slate-900'}`}>
                          {stock.quantity}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleAdjust(stock.item_id, 1)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:text-green-600 hover:bg-green-50 active:bg-green-100 transition-colors touch-manipulation"
                        aria-label="Augmenter"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Quick Actions Footer */}
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                     <span className="text-xs font-medium text-slate-400">
                       Seuil: {stock.min_threshold}
                     </span>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleAdjust(stock.item_id, -stock.quantity)}
                          className="min-h-[40px] text-xs font-bold text-red-500 hover:bg-red-50 active:bg-red-100 px-3 py-2 rounded-lg transition-colors touch-manipulation"
                          title="Mettre à zéro"
                        >
                          Épuiser
                        </button>
                        <button 
                          onClick={() => handleAdjust(stock.item_id, 20 - stock.quantity)}
                          className="min-h-[40px] text-xs font-bold text-blue-500 hover:bg-blue-50 active:bg-blue-100 px-3 py-2 rounded-lg transition-colors touch-manipulation"
                          title="Réapprovisionner (20)"
                        >
                          Refill
                        </button>
                     </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
