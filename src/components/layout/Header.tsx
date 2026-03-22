'use client'

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'

const CartDrawer = dynamic(() => import('./CartDrawer').then((m) => ({ default: m.CartDrawer })), { ssr: false })

const navLinks = [
  { name: 'Accueil', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'À Propos', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const prevCount = React.useRef(0)
  const navPillContainerRef = useRef<HTMLDivElement>(null)
  /** Pill mesurée au layout — évite layoutId Framer (souvent mauvaise origine après scroll + navigation Next). */
  const [navPill, setNavPill] = useState({ left: 0, top: 0, width: 0, height: 0, visible: false })

  const updateNavPillPosition = useCallback(() => {
    const container = navPillContainerRef.current
    if (!container) return
    const activeIndex = navLinks.findIndex((l) => l.href === pathname)
    if (activeIndex < 0) {
      setNavPill((p) => ({ ...p, visible: false }))
      return
    }
    const linkEl = container.querySelector(`[data-nav-pill-link="${activeIndex}"]`) as HTMLElement | null
    if (!linkEl) return
    const c = container.getBoundingClientRect()
    const r = linkEl.getBoundingClientRect()
    setNavPill({
      left: r.left - c.left,
      top: r.top - c.top,
      width: r.width,
      height: r.height,
      visible: true,
    })
  }, [pathname])

  useLayoutEffect(() => {
    updateNavPillPosition()
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(updateNavPillPosition)
    })
    return () => cancelAnimationFrame(id)
  }, [updateNavPillPosition, scrolled])

  useEffect(() => {
    window.addEventListener('resize', updateNavPillPosition)
    return () => window.removeEventListener('resize', updateNavPillPosition)
  }, [updateNavPillPosition])

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Bounce animation when cart count increases
  useEffect(() => {
    if (!mounted) return
    const count = getItemCount()
    if (count > prevCount.current) {
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 600)
    }
    prevCount.current = count
  })

  useEffect(() => {
    const openCart = () => setIsCartOpen(true)
    window.addEventListener('open-cart', openCart)
    return () => window.removeEventListener('open-cart', openCart)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300',
          scrolled
            ? 'py-2.5 bg-white/25 backdrop-blur-xl max-md:bg-white/92 border-b border-white/30 shadow-sm'
            : 'py-4 bg-transparent border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto flex min-h-[52px] items-center">
          {/* Colonne gauche (1/3) — Logo */}
          <div className="flex-1 flex justify-start min-w-0">
            <Link href="/" className="flex items-center group relative z-50" aria-label="Pizza Dal Cielo - Accueil">
              <Image
                src="/images/logo.png"
                alt="Pizza Dal Cielo Logo"
                width={48}
                height={48}
                sizes="48px"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
              />
            </Link>
          </div>

          {/* Colonne centre (1/3) — Nav + cart, centré dans le viewport */}
          <nav className="flex-1 hidden md:flex items-center justify-center gap-4 min-w-0">
            <div
              ref={navPillContainerRef}
              className="relative flex items-center gap-1.5 md:gap-3 rounded-full border border-white/25 bg-white/30 px-1.5 py-1 md:px-2 md:py-1 shadow-sm backdrop-blur-sm max-md:bg-white/80"
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute z-0 rounded-full bg-[#D4633F] shadow-md"
                initial={false}
                animate={{
                  left: navPill.left,
                  top: navPill.top,
                  width: Math.max(navPill.width, 0),
                  height: Math.max(navPill.height, 0),
                  opacity: navPill.visible && navPill.width > 0 ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-nav-pill-link={index}
                    className={cn(
                      'relative z-10 inline-flex items-center justify-center rounded-full px-4 py-2 md:px-6 md:py-2.5 text-sm font-bold uppercase tracking-wider transition-colors duration-200',
                      isActive
                        ? 'text-white'
                        : scrolled
                          ? 'text-[#3D2418] hover:bg-[#D4633F]/10'
                          : 'text-[#3D2418] hover:bg-white/20 hover:text-[#D4633F]'
                    )}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>

            <motion.button
              onClick={() => setIsCartOpen(true)}
              animate={cartBounce ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
              className={cn(
                "relative p-3 rounded-full transition-all duration-300 group",
                scrolled
                  ? "bg-white/50 hover:bg-[#D4633F] hover:text-white text-[#D4633F] shadow-sm border border-[#D4633F]/20"
                  : "bg-white/80 hover:bg-[#D4633F] hover:text-white text-[#3D2418] shadow-lg backdrop-blur-md max-md:bg-white/92"
              )}
              aria-label={`Panier — ${mounted ? getItemCount() : 0} article(s)`}
            >
              <ShoppingBag size={20} />
              {mounted && getItemCount() > 0 && (
                <motion.span
                  key={getItemCount()}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[#D4633F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:bg-white group-hover:text-[#D4633F]"
                >
                  {getItemCount()}
                </motion.span>
              )}
            </motion.button>
          </nav>

          {/* Colonne droite (1/3) — Commander (desktop) ou panier + menu (mobile) */}
          <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
            <Link href="/commander">
              <Button 
                size="sm" 
                className={cn(
                  "hidden md:flex shadow-lg transition-all duration-300 hover:scale-105 shrink-0",
                  scrolled ? "bg-[#D4633F] hover:bg-[#D4633F]/90" : "bg-[#D4633F] border-2 border-white/20"
                )}
                icon={<Phone className="w-4 h-4" />}
              >
                <span className="hidden lg:inline">Commander</span>
              </Button>
            </Link>

            {/* Mobile: panier + menu */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={cn(
                "md:hidden relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors touch-manipulation",
                scrolled ? "text-[#D4633F] bg-white/50" : "text-[#3D2418] bg-white/90 shadow-sm"
              )}
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag size={24} />
              {mounted && getItemCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#D4633F] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {getItemCount()}
                </span>
              )}
            </button>
            <button
              className={cn(
                "md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors z-50 touch-manipulation",
                isOpen ? "bg-white text-[#D4633F] shadow-md" : scrolled ? "text-[#D4633F]" : "text-[#3D2418] bg-white/90 shadow-sm"
              )}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/30 z-40 md:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[80px] left-4 right-4 md:hidden bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 p-2"
              >
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all',
                          isActive 
                            ? 'bg-[#D4633F] text-white shadow-md' 
                            : 'text-[#3D2418] hover:bg-[#F4A088]/20'
                        )}
                      >
                        {link.name}
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </Link>
                    )
                  })}
                  <div className="h-px bg-gray-100 my-2 mx-2" />
                  <Link href="/commander" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-center" icon={<Phone className="w-4 h-4" />}>
                      Commander
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
