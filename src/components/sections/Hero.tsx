'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import { contactInfo } from '@/data/menuData'
import { useQueueEstimate } from '@/hooks/useQueueEstimate'

export const Hero = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { estimate } = useQueueEstimate(mounted)

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-32 pb-20 px-6">
      {/* Background decoration - subtle glows (hidden on mobile for perf) */}
      <div className="hidden sm:block absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-0 right-0 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
        
        {/* Logo DAL CIELO - Géant et flottant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={mounted ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mb-12 group"
        >
          {/* Aura lumineuse derrière le logo */}
          <div className="hidden sm:block absolute inset-0 bg-white/20 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-1000 scale-150" />

          <div className="relative h-40 w-40 md:h-56 md:w-56 z-10">
            <Image
              src="/images/logo.png"
              alt="Pizza dal Cielo"
              fill
              sizes="(max-width: 768px) 160px, 224px"
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              priority
            />
          </div>
        </motion.div>

        {/* Textes - Centrés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 text-primary px-4 py-2 rounded-full font-bold text-xs uppercase tracking-[0.2em] mb-8 shadow-sm border border-white/40"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Une toute nouvelle carte !
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-display font-black text-[#3D2418] leading-[0.9] mb-8 drop-shadow-sm tracking-tighter">
            Des pizzas qui <br />
            <span className="text-white drop-shadow-md">
              touchent le ciel
            </span>
          </h1>
          
          <p className="text-2xl md:text-4xl text-white font-indie leading-tight mb-8 drop-shadow-md max-w-2xl">
            Bien plus qu&apos;une adresse,<br />
            un véritable coup de cœur ! 🌟
          </p>

          <p className="text-lg md:text-xl text-[#3D2418]/70 font-medium max-w-xl mb-12 leading-relaxed">
            Découvrez l&apos;authenticité de la pizza artisanale à Bellevue, Fort-de-France. 
            Des ingrédients frais, une pâte travaillée avec amour et un goût inoubliable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 mb-16">
            <Link href="/menu">
              <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
                Découvrir le menu <ArrowRight size={22} className="ml-2" />
              </Button>
            </Link>
            <Link href="/customize">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10 py-6 text-lg bg-white/80 backdrop-blur-md border-white/50 hover:bg-white hover:scale-105 transition-all shadow-xl">
                Personnaliser ma pizza
              </Button>
            </Link>
          </div>

          {/* Footer Hero - Timer & TripAdvisor alignés */}
          <div className="flex flex-col sm:flex-row items-center gap-8 pt-8 border-t border-white/20 w-full justify-center">
            {mounted && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/70 border border-white/40 shadow-sm transition-all hover:bg-white/80">
                <div className={`w-3 h-3 rounded-full ${
                  !estimate.ovenAvailable
                    ? 'bg-red-500 animate-pulse'
                    : estimate.estimatedMinutes <= 20
                      ? 'bg-green-500 animate-pulse'
                      : estimate.estimatedMinutes <= 40
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-red-500 animate-pulse'
                }`} />
                <span className="text-sm font-black text-[#3D2418]">
                  {!estimate.ovenAvailable
                    ? 'Four temporairement indisponible'
                    : estimate.estimateSource === 'manual'
                      ? `Prêt en ~${estimate.estimatedMinutes} min`
                    : estimate.totalItems === 0
                      ? 'Four disponible'
                      : `Prêt en ~${estimate.estimatedMinutes} min`}
                </span>
              </div>
            )}

            <a
              href={contactInfo.socials.tripadvisor}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/70 border border-white/40 shadow-sm hover:bg-white/80 transition-all"
            >
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map((_, i) => <Star key={i} size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 50}ms` }} />)}
              </div>
              <span className="text-sm font-bold text-[#3D2418]">Avis TripAdvisor</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
