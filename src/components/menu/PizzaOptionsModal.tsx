'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Pizza, Check, AlertCircle } from 'lucide-react'
import { menuData } from '@/data/menuData'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface PizzaOptionItem {
  id: number
  name: string
  price: number
  category?: string
  image?: string
  /** Si true, proposer le choix de sauce après cuisson (Ketchup, Barbecue, Burger, Miel, Pesto). Sinon seule la base est au choix. */
  sauceAuChoix?: boolean
  /** Choix obligatoire d'ingrédients parmi une liste (ex. : 3 viandes pour le Suprême) */
  varianteChoix?: { count: number; options: string[] }
  /** Bases supplémentaires spécifiques à cette pizza (ex. : Base colombo pour la Colombo) */
  extraBases?: { id: number; name: string; price: number }[]
}

const SUPPLEMENT_CATEGORIES = ['Fromages', 'Légumes', 'Viandes', 'Produits de la mer'] as const

interface PizzaOptionsModalProps {
  open: boolean
  onClose: () => void
  pizza: PizzaOptionItem
  onAdd: (payload: {
    customizations: string[]
    totalPrice: number
    supplements: Array<{ id: number; name: string; price: number }>
  }) => void
}

export function PizzaOptionsModal({ open, onClose, pizza, onAdd }: PizzaOptionsModalProps) {
  const [base, setBase] = useState(menuData.bases[0])
  const [sauce, setSauce] = useState<{ id: number; name: string; price: number }>(menuData.sauces[0])
  const [selectedSupplements, setSelectedSupplements] = useState<Set<number>>(new Set())
  const [selectedVariante, setSelectedVariante] = useState<Set<string>>(new Set())
  const [varianteError, setVarianteError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(typeof document !== 'undefined')
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (open) {
      document.body.style.overflow = 'hidden'
      setSelectedSupplements(new Set())
      setSelectedVariante(new Set())
      setVarianteError(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, mounted])

  const hasSauceChoice = pizza.sauceAuChoix === true
  const bases = [...menuData.bases, ...(pizza.extraBases ?? [])]
  const showSupplements = pizza.category !== 'Friands'
  // Sauce incluse dans le prix pizza — seul le choix de laquelle est demandé
  const sauceOptions = menuData.sauces

  const activeSups = menuData.supplements.filter(s => selectedSupplements.has(s.id))
  const suppTotal = activeSups.reduce((sum, s) => sum + s.price, 0)
  const totalPrice = pizza.price // sauce toujours incluse, pas de surcoût
  const varianteOk = !pizza.varianteChoix || selectedVariante.size === pizza.varianteChoix.count

  const toggleSupplement = (id: number) => {
    setSelectedSupplements(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleVariante = (name: string) => {
    setVarianteError(false)
    setSelectedVariante(prev => {
      const n = new Set(prev)
      if (n.has(name)) {
        n.delete(name)
      } else if (!pizza.varianteChoix || n.size < pizza.varianteChoix.count) {
        n.add(name)
      }
      return n
    })
  }

  const handleAdd = () => {
    if (!varianteOk) {
      setVarianteError(true)
      return
    }
    const customizations: string[] = hasSauceChoice
      ? [`Base: ${base.name}`, `Sauce: ${sauce.name}`]
      : [`Base: ${base.name}`]

    if (pizza.varianteChoix && selectedVariante.size > 0) {
      customizations.push(`Choix: ${Array.from(selectedVariante).join(', ')}`)
    }

    onAdd({
      customizations,
      totalPrice,
      supplements: activeSups.map(s => ({ id: s.id, name: s.name, price: s.price })),
    })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const headerSubtitle = pizza.varianteChoix
    ? hasSauceChoice ? 'Base, sauce & choix' : 'Base & choix'
    : hasSauceChoice ? 'Base & sauce' : 'Choisir la base'

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-[#3D2418]/60 backdrop-blur-md z-[9998] flex items-center justify-center p-4 sm:p-6"
            style={{ top: 0, left: 0, right: 0, bottom: 0 }}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ left: '50%', top: '50%', x: '-50%', y: '-50%' }}
            className="fixed z-[9999] w-full max-w-lg max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-[0_25px_80px_-12px_rgba(61,36,24,0.35)] ring-1 ring-black/5"
          >
            {/* Header fixe */}
            <div className="flex items-center justify-between shrink-0 p-4 sm:p-5 border-b border-gray-100 bg-[#FFF8F0]/50 rounded-t-3xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Pizza size={22} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h2 id="modal-title" className="text-lg font-black text-[#3D2418] truncate">
                    {pizza.name}
                  </h2>
                  <p className="text-sm font-bold text-primary">{headerSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-500 hover:text-[#3D2418] shrink-0"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-5">
              {/* Base */}
              <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5">Base (incluse)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(bases.length, 4)}, minmax(0, 1fr))` }}>
                  {bases.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBase(b)}
                      className={cn(
                        'py-3 px-3 rounded-xl border-2 text-sm font-bold transition-all',
                        base.id === b.id
                          ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                          : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5 text-[#3D2418]'
                      )}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Sauce */}
              {hasSauceChoice && (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5">Sauce (après cuisson)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sauceOptions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSauce(s)}
                        className={cn(
                          'py-2.5 px-3 rounded-xl border-2 text-left transition-all flex flex-col gap-0.5',
                          sauce.id === s.id && sauce.name === s.name
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5'
                        )}
                      >
                        <span className="font-bold text-sm">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Variante choix obligatoire */}
              {pizza.varianteChoix && (
                <section
                  className={cn(
                    'p-3 rounded-2xl border-2 transition-colors',
                    varianteError
                      ? 'border-red-400 bg-red-50'
                      : varianteOk
                      ? 'border-green-300 bg-green-50/40'
                      : 'border-amber-200 bg-amber-50/40'
                  )}
                >
                  <h3 className={cn(
                    'text-xs font-black uppercase tracking-widest mb-2.5 flex items-center gap-1.5',
                    varianteError ? 'text-red-500' : 'text-gray-500'
                  )}>
                    {varianteError && <AlertCircle size={13} className="shrink-0" />}
                    Choisissez {pizza.varianteChoix.count} ingrédient{pizza.varianteChoix.count > 1 ? 's' : ''}
                    <span className={cn(
                      'normal-case font-bold ml-auto',
                      varianteOk ? 'text-green-600' : varianteError ? 'text-red-500' : 'text-amber-600'
                    )}>
                      ({selectedVariante.size}/{pizza.varianteChoix.count})
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pizza.varianteChoix.options.map(opt => {
                      const active = selectedVariante.has(opt)
                      const disabled = !active && selectedVariante.size >= pizza.varianteChoix!.count
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleVariante(opt)}
                          disabled={disabled}
                          className={cn(
                            'flex items-center gap-1.5 py-2 px-3 rounded-xl border-2 text-sm font-bold transition-all min-h-[44px]',
                            active
                              ? 'border-primary bg-primary text-white'
                              : disabled
                              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                              : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5 text-[#3D2418]'
                          )}
                        >
                          {active && <Check size={13} />}
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {varianteError && (
                    <p className="mt-2 text-xs font-bold text-red-500">
                      Veuillez choisir {pizza.varianteChoix.count} ingrédient{pizza.varianteChoix.count > 1 ? 's' : ''} avant d&apos;ajouter.
                    </p>
                  )}
                </section>
              )}

              {/* Suppléments (pizzas uniquement, pas les friands) */}
              {showSupplements && (
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Suppléments <span className="normal-case font-medium">(optionnel)</span>
                  </h3>
                  <div className="space-y-3">
                    {SUPPLEMENT_CATEGORIES.map(cat => {
                      const items = menuData.supplements.filter(s => s.category === cat)
                      if (!items.length) return null
                      return (
                        <div key={cat}>
                          <p className="text-xs font-bold text-gray-400 mb-1.5">{cat}</p>
                          <div className="flex flex-wrap gap-2">
                            {items.map(s => {
                              const active = selectedSupplements.has(s.id)
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => toggleSupplement(s.id)}
                                  className={cn(
                                    'flex items-center gap-1.5 py-2 px-3 rounded-xl border-2 text-sm font-bold transition-all min-h-[44px]',
                                    active
                                      ? 'border-primary bg-primary text-white'
                                      : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5 text-[#3D2418]'
                                  )}
                                >
                                  {active && <Check size={13} className="shrink-0" />}
                                  {s.name}
                                  <span className={cn('text-xs', active ? 'text-white/80' : 'text-primary font-black')}>
                                    +{s.price}€
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Footer fixe avec CTA */}
            <div className="shrink-0 flex items-center justify-between gap-4 p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 rounded-b-3xl">
              <div className="min-w-0">
                {activeSups.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-400 font-medium leading-tight">
                      Pizza {totalPrice.toFixed(2).replace('.', ',')} € · +{activeSups.length} suppl.
                    </p>
                    <span className="text-2xl font-black text-primary tabular-nums">
                      {(totalPrice + suppTotal).toFixed(2).replace('.', ',')} €
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-black text-primary tabular-nums">
                    {totalPrice.toFixed(2).replace('.', ',')} €
                  </span>
                )}
              </div>
              <Button
                onClick={handleAdd}
                icon={<ShoppingBag size={18} />}
                disabled={!varianteOk}
                className={cn('shadow-lg shadow-primary/20', !varianteOk && 'opacity-60 cursor-not-allowed')}
              >
                Ajouter au panier
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (!mounted) return null
  return createPortal(modal, document.body)
}
