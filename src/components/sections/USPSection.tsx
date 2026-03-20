'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Wheat, Leaf, Flame } from 'lucide-react'

const pillars = [
  {
    icon: Wheat,
    color: 'text-[#D4633F]',
    bg: 'bg-[#D4633F]/10',
    border: 'border-[#D4633F]/20',
    title: 'Pâte Artisanale',
    desc: 'Travaillée à la main chaque matin selon une recette transmise avec amour. Légère, aérée, croustillante.',
    detail: '⏱ Fermentée 24h',
  },
  {
    icon: Leaf,
    color: 'text-[#8BB174]',
    bg: 'bg-[#8BB174]/10',
    border: 'border-[#8BB174]/20',
    title: 'Ingrédients Frais',
    desc: 'Tomates fraîches, fromages sélectionnés et garnitures locales de Martinique pour des pizzas qui ont du goût.',
    detail: '🌴 Produits locaux',
  },
  {
    icon: Flame,
    color: 'text-[#F4D06F]',
    bg: 'bg-[#F4D06F]/15',
    border: 'border-[#F4D06F]/30',
    title: 'Four Artisanal',
    desc: 'Cuite à haute température pour une croûte parfaitement dorée. Ce croustillant unique qui revient chaque fois.',
    detail: '🔥 Haute température',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function USPSection() {
  return (
    <section className="py-20 px-4 relative" aria-labelledby="usp-title">
      <div className="max-w-6xl mx-auto">

        {/* Titre section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 bg-primary/10 px-4 py-1.5 rounded-full">
            Notre engagement
          </span>
          <h2 id="usp-title" className="text-4xl md:text-5xl font-display font-black text-[#3D2418]">
            Pourquoi <span className="text-primary">Dal Cielo ?</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                className={`group relative bg-white/65 backdrop-blur-sm max-md:bg-white/92 rounded-3xl p-8 border-2 ${p.border} shadow-md hover:shadow-xl transition-shadow overflow-hidden`}
              >
                {/* Cercle décoratif fond */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${p.bg} rounded-full opacity-60 group-hover:scale-125 transition-transform duration-500`} />

                {/* Icone */}
                <div className={`relative w-14 h-14 ${p.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className={p.color} strokeWidth={1.8} />
                </div>

                <h3 className="text-xl font-black text-[#3D2418] mb-3 relative">{p.title}</h3>
                <p className="text-[#3D2418]/70 text-sm leading-relaxed mb-5 relative">{p.desc}</p>

                {/* Badge détail */}
                <span className={`inline-block text-xs font-bold ${p.bg} ${p.color} px-3 py-1 rounded-full relative`}>
                  {p.detail}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
