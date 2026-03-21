'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import { contactInfo } from '@/data/menuData'
import { useQueueEstimate } from '@/hooks/useQueueEstimate'

export const Hero = () => {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth <= 768)
  }, [])
  const { estimate } = useQueueEstimate(mounted)
  const prefersReducedMotion = useReducedMotion()

  // ── Parallax scroll layers (désactivé si prefers-reduced-motion ou mobile) ─
  const disableParallax = prefersReducedMotion || isMobile
  const { scrollY } = useScroll()
  const glowY = useTransform(scrollY, [0, 600], disableParallax ? [0, 0] : [0, 60])
  const textY = useTransform(scrollY, [0, 400], disableParallax ? [0, 0] : [0, 60])
  const logoY = useTransform(scrollY, [0, 400], disableParallax ? [0, 0] : [0, 40])
  return (
    <section
      className="relative min-h-[95vh] flex flex-col overflow-hidden pt-32 pb-16 sm:pb-20 px-0"
      aria-labelledby="hero-heading"
    >

      {/* ── Layer 0 : Glow background (parallax) ────────────────── */}
      <motion.div
        style={{ y: glowY }}
        className="hidden sm:block absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        style={{ y: glowY }}
        className="hidden sm:block absolute bottom-0 right-0 w-[450px] h-[450px] bg-yellow-400/5 rounded-full blur-[110px] pointer-events-none"
      />

      {/* ── Contenu principal ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 w-full min-h-0">
      <div className="container max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">

        {/* Logo — parallax + float continu + fade-in mount */}
        <motion.div style={{ y: logoY }} className="relative mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="group"
          >
            <div className="hidden sm:block absolute inset-0 bg-white/20 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-1000 scale-150" />
            {/* Float continu indépendant */}
            <motion.div
              animate={prefersReducedMotion ? { y: 0 } : { y: [0, -10, 0] }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <div className="relative h-40 w-40 md:h-60 md:w-60 z-10">
                <Image
                  src="/images/logo.png"
                  alt="Pizza Dal Cielo"
                  fill
                  sizes="(max-width: 768px) 160px, 240px"
                  className="object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.22)]"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Texte — parallax + fade-in */}
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, y: 24 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Badge "nouveau" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.55 }}
            className="inline-flex items-center gap-2 bg-white/80 text-primary px-4 py-2 rounded-full font-bold text-xs uppercase tracking-[0.2em] mb-8 shadow-sm border border-white/40"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Une toute nouvelle carte !
          </motion.div>

          <h1 id="hero-heading" className="text-5xl md:text-8xl font-display font-black text-[#3D2418] leading-[0.9] mb-8 drop-shadow-sm tracking-tighter">
            Des pizzas qui <br />
            <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.40)]">
              touchent le ciel
            </span>
          </h1>

          <p className="text-2xl md:text-4xl text-white font-indie leading-tight mb-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] max-w-2xl flex flex-col items-center gap-1">
            <span>Bien plus qu&apos;une adresse,</span>
            <span className="inline-flex items-center gap-2">
              un véritable coup de cœur
              <Star className="shrink-0 text-yellow-sun opacity-95" size={28} strokeWidth={1.75} fill="currentColor" aria-hidden />
            </span>
          </p>

          <p className="text-lg md:text-xl text-[#3D2418] font-medium max-w-xl mb-12 leading-relaxed drop-shadow-sm">
            Découvrez l&apos;authenticité de la pizza artisanale à Bellevue, Fort-de-France.
            Des ingrédients frais, une pâte travaillée avec amour et un goût inoubliable.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 mb-10 md:mb-12">
            <Link href="/menu">
              <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg shadow-2xl shadow-primary/25 hover:scale-105 active:scale-95 transition-transform duration-300">
                Découvrir le menu <ArrowRight size={22} className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Barre statut + TripAdvisor — cibles ≥ 44px, focus visible (kb-ui-ux-pro-max) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-5 pt-10 border-t border-white/25 w-full max-w-2xl mx-auto">
            {mounted && (
              <div
                className="flex min-h-[48px] items-center gap-3 rounded-3xl border border-white/45 bg-white/65 px-5 py-3.5 shadow-[0_8px_30px_rgba(61,36,24,0.06)] backdrop-blur-md transition-colors hover:bg-white/75"
                role="status"
                aria-live="polite"
              >
                <div
                  className={`size-3 shrink-0 rounded-full ${
                    !estimate.ovenAvailable
                      ? 'bg-red-500'
                      : estimate.estimatedMinutes <= 20
                        ? 'bg-green-600'
                        : estimate.estimatedMinutes <= 40
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                  } ${!prefersReducedMotion && !estimate.ovenAvailable ? 'animate-pulse' : ''}`}
                  aria-hidden
                />
                <span className="text-sm font-semibold leading-snug text-[#3D2418]">
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
              className="group flex min-h-[48px] items-center justify-center gap-3 rounded-3xl border border-white/45 bg-white/65 px-5 py-3.5 shadow-[0_8px_30px_rgba(61,36,24,0.06)] backdrop-blur-md transition-colors hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="flex text-amber-500" aria-hidden>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" className="transition-transform group-hover:scale-105" style={{ transitionDelay: `${i * 40}ms` }} />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#3D2418]">Avis TripAdvisor</span>
            </a>
          </div>
        </motion.div>
      </div>
      </div>
    </section>
  )
}
