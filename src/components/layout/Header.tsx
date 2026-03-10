'use client'

import React, { useState, useEffect } from 'react'
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
  { name: 'Perso', href: '/customize' },
  { name: 'À Propos', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { getItemCount } = useCart()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const openCart = () => setIsCartOpen(true)
    window.addEventListener('open-cart', openCart)
    return () => window.removeEventListener('open-cart', openCart)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 bg-transparent',
          scrolled 
            ? 'py-3' 
            : 'pt-6 pb-4'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center">
          {/* Colonne gauche (1/3) — Logo */}
          <div className="flex-1 flex justify-start min-w-0">
            <Link href="/" className="flex items-center group relative z-50" aria-label="Pizza dal Cielo - Accueil">
              <Image
                src="/images/logo.png"
                alt="Pizza dal Cielo Logo"
                width={48}
                height={48}
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
              />
            </Link>
          </div>

          {/* Colonne centre (1/3) — Nav + cart, centré dans le viewport */}
          <nav className="flex-1 hidden md:flex items-center justify-center gap-4 min-w-0">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/10 shadow-sm">
                {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-300',
                      isActive 
                        ? 'text-white bg-[#D4633F] shadow-md' 
                        : scrolled 
                          ? 'text-[#3D2418] hover:bg-[#D4633F]/10' 
                          : 'text-[#3D2418] hover:bg-white/20 hover:text-[#D4633F]'
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-[#D4633F] rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className={cn(
                "relative p-3 rounded-full transition-all duration-300 group",
                scrolled 
                  ? "bg-white/50 hover:bg-[#D4633F] hover:text-white text-[#D4633F] shadow-sm border border-[#D4633F]/20" 
                  : "bg-white/80 hover:bg-[#D4633F] hover:text-white text-[#3D2418] shadow-lg backdrop-blur-md"
              )}
            >
              <ShoppingBag size={20} />
              {mounted && getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4633F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:bg-white group-hover:text-[#D4633F]">
                  {getItemCount()}
                </span>
              )}
            </button>
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
                scrolled ? "text-[#D4633F] bg-white/50" : "text-[#3D2418] bg-white/80 backdrop-blur-sm shadow-sm"
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
                isOpen ? "bg-white text-[#D4633F] shadow-md" : scrolled ? "text-[#D4633F]" : "text-[#3D2418] bg-white/80 backdrop-blur-sm shadow-sm"
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
