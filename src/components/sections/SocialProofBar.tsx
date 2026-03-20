'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, UtensilsCrossed, MapPin } from 'lucide-react'

interface CounterProps {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
}

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}

const stats = [
  {
    icon: Star,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    value: 4.8,
    suffix: '/5',
    label: 'Note TripAdvisor',
    subLabel: '200+ avis clients',
    isRating: true,
  },
  {
    icon: UtensilsCrossed,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
    value: 2000,
    suffix: '+',
    label: 'Commandes servies',
    subLabel: 'Depuis l\'ouverture',
    isRating: false,
  },
  {
    icon: MapPin,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    value: 0,
    suffix: '',
    label: 'Bellevue, Fort-de-France',
    subLabel: 'Martinique 🌴',
    isRating: false,
    isText: true,
    textValue: '📍',
  },
]

export function SocialProofBar() {
  return (
    <section className="py-6 px-4 relative z-10" aria-label="Nos chiffres clés">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/70 backdrop-blur-md max-md:bg-white/92 rounded-3xl border border-white/60 shadow-lg shadow-[#3D2418]/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#3D2418]/10">

          {/* Stat 1 — Note */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-4 px-6 py-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <div className={`w-12 h-12 ${stats[0].bgColor} rounded-2xl flex items-center justify-center shrink-0`}>
              <Star size={22} className={stats[0].iconColor} fill="currentColor" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#3D2418] leading-none">
                <AnimatedCounter target={48} suffix="/5" duration={1500} />
                {/* Trick: on affiche 4.8 via un diviseur */}
              </p>
              <p className="text-sm font-bold text-[#3D2418]/70 mt-0.5">{stats[0].label}</p>
              <p className="text-xs text-[#3D2418]/50">{stats[0].subLabel}</p>
            </div>
          </motion.div>

          {/* Stat 2 — Commandes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-4 px-6 py-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <UtensilsCrossed size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#3D2418] leading-none">
                <AnimatedCounter target={2000} suffix="+" duration={2000} />
              </p>
              <p className="text-sm font-bold text-[#3D2418]/70 mt-0.5">Commandes servies</p>
              <p className="text-xs text-[#3D2418]/50">Depuis l&apos;ouverture</p>
            </div>
          </motion.div>

          {/* Stat 3 — Localisation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-4 px-6 py-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#3D2418] leading-none">Bellevue</p>
              <p className="text-sm font-bold text-[#3D2418]/70 mt-0.5">Fort-de-France</p>
              <p className="text-xs text-[#3D2418]/50">Martinique 🌴</p>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  )
}
