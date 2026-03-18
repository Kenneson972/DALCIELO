'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, MessageCircle } from 'lucide-react'

interface OrderingComingSoonModalProps {
  onClose: () => void
}

export function OrderingComingSoonModal({ onClose }: OrderingComingSoonModalProps) {
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
            <div className="text-5xl mb-4">🍕</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Commandez par téléphone
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              La commande en ligne sera bientôt disponible.<br />
              En attendant, contactez-nous directement.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href="tel:+596696887270"
                className="flex items-center justify-center gap-3 bg-primary text-white px-6 py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
              >
                <Phone size={20} />
                Appeler
              </a>
              <a
                href="https://wa.me/596696887270"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={20} />
                WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
