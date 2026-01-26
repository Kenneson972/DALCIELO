'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Pizza, Phone, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { CartDrawer } from './CartDrawer'

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

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
          scrolled ? 'glass py-3 shadow-md' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Pizza className="text-white w-6 h-6" />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-primary">
              DAL CIELO
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-bold text-sm uppercase tracking-widest transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-dark/70'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
            >
              <ShoppingBag size={24} />
              {mounted && getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {getItemCount()}
                </span>
              )}
            </button>

            <Button size="sm" icon={<Phone className="w-4 h-4" />}>
              Commander
            </Button>
          </nav>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-primary"
            >
              <ShoppingBag size={24} />
              {mounted && getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {getItemCount()}
                </span>
              )}
            </button>
            <button
              className="text-primary"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass absolute top-full left-0 right-0 border-t border-primary/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'font-bold text-lg py-2 transition-colors',
                      pathname === link.href ? 'text-primary' : 'text-dark/70'
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                <Button className="w-full mt-2" icon={<Phone className="w-5 h-5" />}>
                  Commander
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
