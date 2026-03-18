'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { PizzaOptionsModal } from '@/components/menu/PizzaOptionsModal'
import { OrderingComingSoonModal } from '@/components/ui/OrderingComingSoonModal'
import { ORDERING_ENABLED } from '@/lib/ordering'
import { generateSlug } from '@/lib/utils'

export interface PizzaSliderItem {
  id: number
  name: string
  price: number
  image?: string | null
  category?: string
  slug?: string
}

interface PizzaSliderProps {
  items: PizzaSliderItem[]
}

const PIZZA_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop'

export function PizzaSlider({ items }: PizzaSliderProps) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [visibleCount, setVisibleCount] = useState(3)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()
  const [optionsItem, setOptionsItem] = useState<PizzaSliderItem | null>(null)
  const [showComingSoon, setShowComingSoon] = useState(false)

  // Responsive visible count
  useEffect(() => {
    const updateVisibleCount = () => {
      if (typeof window === 'undefined') return
      if (window.innerWidth < 768) setVisibleCount(1)
      else if (window.innerWidth < 1024) setVisibleCount(2)
      else setVisibleCount(3)
    }
    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  const total = items.length
  const maxIndex = Math.max(0, total - visibleCount)

  const goTo = useCallback(
    (nextIndex: number) => {
      if (total <= 0) return
      const clamped = ((nextIndex % total) + total) % total
      setIndex(Math.min(clamped, maxIndex))
    },
    [total, maxIndex]
  )

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])
  const goNext = useCallback(() => goTo(index + 1), [goTo, index])

  // Auto-play
  useEffect(() => {
    if (total <= 0 || isPaused) return
    const timer = setInterval(() => {
      setIndex((i) => {
        if (i >= maxIndex) return 0
        return i + 1
      })
    }, 3500)
    return () => clearInterval(timer)
  }, [total, isPaused, maxIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const delta = e.changedTouches[0].clientX - touchStart
    setTouchStart(null)
    if (Math.abs(delta) < 50) return
    if (delta > 0) goPrev()
    else goNext()
  }

  const handleCommander = (item: PizzaSliderItem) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!ORDERING_ENABLED) {
      setShowComingSoon(true)
      return
    }
    setOptionsItem(item)
  }

  const handleOptionsAdd = (item: PizzaSliderItem) => ({ customizations, totalPrice, supplements }: { customizations: string[]; totalPrice: number; supplements: Array<{ id: number; name: string; price: number }> }) => {
    const suppTotal = supplements.reduce((sum, s) => sum + s.price, 0)
    const allCustomizations = [...customizations]
    if (supplements.length > 0) {
      allCustomizations.push(`Suppléments: ${supplements.map(s => s.name).join(', ')}`)
    }
    addItem({
      id: item.id,
      name: item.name,
      price: totalPrice + suppTotal,
      image: item.image ?? undefined,
      category: item.category ?? 'Pizzas',
      customizations: allCustomizations,
    })
    setOptionsItem(null)
  }

  if (!items.length) return null

  const translatePercent = visibleCount === 1 ? index * 100 : index * (100 / visibleCount)

  return (
    <>
      {showComingSoon && <OrderingComingSoonModal onClose={() => setShowComingSoon(false)} />}
      {optionsItem && (
        <PizzaOptionsModal
          open
          onClose={() => setOptionsItem(null)}
          pizza={{ id: optionsItem.id, name: optionsItem.name, price: optionsItem.price, category: optionsItem.category, image: optionsItem.image ?? undefined }}
          onAdd={handleOptionsAdd(optionsItem)}
        />
      )}
      <section className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden pt-24 pb-16 px-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-7xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-6xl font-display font-black text-[#3D2418] mb-3 text-shadow-sm">
            Des pizzas qui <span className="text-primary">touchent le ciel</span>
          </h2>
          <p className="text-lg text-[#3D2418]/70 max-w-2xl mx-auto mb-6">
            Découvrez nos pizzas artisanales à Fort-de-France
          </p>
        </div>

        {/* Slider track */}
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          <div
            className="flex transition-transform duration-[600ms] ease-out will-change-transform"
            style={{
              transform: `translate3d(-${translatePercent}%, 0, 0)`,
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 px-2 md:px-3"
                style={{
                  width: visibleCount === 1 ? '100%' : visibleCount === 2 ? '50%' : '33.333%',
                }}
              >
                <Link
                  href={`/menu/${item.slug ?? generateSlug(item.name)}`}
                  className="group block h-full flex flex-col items-center"
                >
                  <div className="relative w-full aspect-square overflow-visible flex items-center justify-center bg-transparent">
                    <Image
                      src={item.image || PIZZA_FALLBACK_IMAGE}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 30vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      unoptimized={Boolean(item.image && !item.image.includes('unsplash'))}
                    />
                  </div>
                  <div className="w-full mt-3 flex flex-col items-center text-center">
                    <h3 className="text-lg md:text-xl font-black text-[#3D2418] line-clamp-1 drop-shadow-sm">
                      {item.name}
                    </h3>
                    <p className="text-primary font-bold text-base md:text-lg mt-0.5">{item.price}€</p>
                    <div className="mt-3 w-full max-w-[200px]">
                      <Button
                        size="md"
                        variant="primary"
                        className="w-full shadow-lg"
                        icon={<ShoppingBag size={18} />}
                        onClick={handleCommander(item)}
                      >
                        Commander
                      </Button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:left-4 md:translate-x-0 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-[#3D2418] hover:bg-white hover:scale-110 transition-all"
          aria-label="Précédent"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:right-4 md:translate-x-0 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-[#3D2418] hover:bg-white hover:scale-110 transition-all"
          aria-label="Suivant"
        >
          <ChevronRight size={24} />
        </button>

        <div className="mt-16 text-center">
          <Link 
            href="/menu" 
            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 group"
          >
            Voir toute la carte 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
    </>
  )
}
