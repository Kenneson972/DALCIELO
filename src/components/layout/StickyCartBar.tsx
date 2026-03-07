'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export function StickyCartBar() {
  const { getItemCount, getTotal } = useCart()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const count = getItemCount()
  const total = getTotal()

  const handleOpen = () => {
    window.dispatchEvent(new Event('open-cart'))
  }

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[90] md:hidden px-4 pb-6"
        >
          <button
            onClick={handleOpen}
            className="w-full flex items-center justify-between bg-gradient-to-r from-[#E17B5F] to-[#C4522A] text-white rounded-2xl px-5 py-4 shadow-2xl shadow-[#E17B5F]/40 active:scale-[0.98] transition-transform"
            aria-label={`Ouvrir le panier — ${count} article${count > 1 ? 's' : ''} — ${total.toFixed(2)} €`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag size={22} />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#C4522A] text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              </div>
              <span className="font-bold text-sm">Voir mon panier</span>
            </div>
            <span className="font-black text-lg">{total.toFixed(2)} €</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
