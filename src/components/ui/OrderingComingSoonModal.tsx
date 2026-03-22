'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface OrderingComingSoonModalProps {
  onClose: () => void
  reason?: 'monday' | 'sunday'
}

/** Affiché quand la commande en ligne est indisponible (fermeture lundi ou dimanche). */
export function OrderingComingSoonModal({ onClose, reason = 'monday' }: OrderingComingSoonModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>

          <div className="p-8 pt-10">
            <div className="text-5xl mb-4">🔒</div>
            {reason === 'sunday' ? (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Fermé dimanche &amp; lundi</h2>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  La pizzeria est fermée le <strong>dimanche</strong> et le <strong>lundi</strong>.
                  <br />
                  Commande en ligne à partir de <strong>mardi</strong> (18h–22h).
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Fermé le lundi</h2>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  La pizzeria est fermée tous les lundis.
                  <br />
                  Commande en ligne à partir de <strong>mardi</strong> (18h–22h).
                </p>
              </>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl font-bold text-base hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
