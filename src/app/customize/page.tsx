'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Pizza, ArrowRight } from 'lucide-react'

export default function CustomizePage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-xl mx-auto text-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md p-10 md:p-14 shadow-sm"
        >
          <div className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Pizza size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#3D2418] mb-4">
            Personnaliser ma Pizza
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-primary mb-6">
            Bientôt disponible
          </p>
          <p className="text-[#3D2418]/70 text-lg mb-10 max-w-md mx-auto">
            La création de votre pizza sur mesure arrive très bientôt. En attendant, découvrez notre menu et nos pizzas signatures !
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transition-all active:scale-95 min-h-[44px]"
          >
            <ArrowRight size={20} />
            Voir le menu
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
