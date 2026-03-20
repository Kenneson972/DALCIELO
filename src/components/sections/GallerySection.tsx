'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Instagram, ArrowUpRight } from 'lucide-react'
import { contactInfo } from '@/data/menuData'

/** Accueil : uniquement le lien Instagram (grille photos retirée). */
export const GallerySection = () => {
  const href = contactInfo.socials.instagram

  return (
    <section className="py-16 sm:py-20 px-4 relative" aria-label="Instagram Pizza Dal Cielo">
      <div className="max-w-2xl mx-auto">
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between w-full rounded-3xl bg-gradient-to-r from-[#E17B5F] to-[#D4633F] p-6 md:p-8 group border border-white/20 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 min-h-[56px]"
        >
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0" aria-hidden>
              <Instagram size={28} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-0.5">Suivez-nous</p>
              <p className="text-xl md:text-2xl font-black text-white truncate">@pizza_dal_cielo</p>
              <p className="text-white/70 text-sm">Photos et actus sur Instagram</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white font-black text-sm group-hover:gap-3 transition-all shrink-0 ml-3">
            <span className="hidden sm:block">Voir le profil</span>
            <ArrowUpRight size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden />
          </div>
        </motion.a>
      </div>
    </section>
  )
}
