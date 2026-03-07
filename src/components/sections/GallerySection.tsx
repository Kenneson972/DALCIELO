'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Instagram, ArrowUpRight } from 'lucide-react'
import { contactInfo } from '@/data/menuData'

export const GallerySection = () => {
  return (
    <section className="py-24 px-6 relative bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl mb-6 text-[#3D2418]">
              Suivez nos <span className="text-primary">aventures</span>
            </h2>
            <p className="text-[#3D2418]/80 text-lg max-w-xl">
              Dernières créations, ambiance de la pizzeria et coulisses : retrouvez tout sur notre Instagram.
            </p>
          </div>
        </div>

        <motion.a
          href={contactInfo.socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="block w-full relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#E17B5F]/90 to-[#D4633F]/90 p-10 md:p-14 text-left group border-2 border-white/20 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-[url('/images/site-background.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Instagram size={40} className="text-white md:w-12 md:h-12" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-bold uppercase tracking-widest mb-1">
                  Notre fil
                </p>
                <p className="text-2xl md:text-3xl font-black text-white">
                  @pizza_dal_cielo
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Pizzas, coulisses et bonne humeur
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white font-bold group-hover:gap-3 transition-all">
              <span>Voir le profil</span>
              <ArrowUpRight size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </motion.a>
      </div>
    </section>
  )
}
