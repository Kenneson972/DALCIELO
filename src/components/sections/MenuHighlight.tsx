'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Pizza, ShoppingBag, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { PizzaOptionsModal } from '@/components/menu/PizzaOptionsModal'
import { OrderingComingSoonModal } from '@/components/ui/OrderingComingSoonModal'
import { orderingBlockReason } from '@/lib/ordering'
import { ChefValidUntilTimer } from '@/components/ui/ChefValidUntilTimer'

/** Pizza du Chef : vient de products (Supabase) si dispo, sinon menuData. Mise à jour auto via API. */
type ChefPizzaItem = {
  id?: number
  menu_id?: number
  name: string
  price: number
  description?: string | null
  ingredients?: string[] | null
  image?: string | null
  image_url?: string | null
  chef_valid_until?: string | null
  slug?: string | null
} | null

interface MenuHighlightProps {
  chefPizza?: ChefPizzaItem
}

export const MenuHighlight = ({ chefPizza: propChefPizza }: MenuHighlightProps) => {
  const [chefPizza, setChefPizza] = useState<ChefPizzaItem>(propChefPizza ?? null)
  const { addItem } = useCart()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [blockReason, setBlockReason] = useState<'monday' | null>(null)

  // Rafraîchir la Pizza du Chef depuis l’API au montage (pas de cache) pour refléter les modifs admin
  useEffect(() => {
    fetch('/api/announcement', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      .then((res) => res.json())
      .then((data) => {
        const product = data?.product
        if (product && product.name) {
          setChefPizza({
            id: product.id,
            menu_id: product.menu_id,
            name: product.name,
            price: product.price,
            description: product.description ?? null,
            ingredients: product.ingredients ?? null,
            image: product.image_url ?? product.image ?? null,
            image_url: product.image_url ?? null,
            chef_valid_until: product.chef_valid_until ?? null,
            slug: product.slug ?? null,
          })
        } else {
          setChefPizza(null)
        }
      })
      .catch(() => {})
  }, [])

  if (!chefPizza) return null

  const prefersReducedMotion = useReducedMotion()
  const id = Number(chefPizza.menu_id ?? (chefPizza as { id?: number }).id ?? 0)
  const name = chefPizza.name
  const price = Number(chefPizza.price)
  const description =
    chefPizza.description ??
    'Une recette unique et audacieuse qui change tous les 15 jours.'
  const ingredients = Array.isArray(chefPizza.ingredients) ? chefPizza.ingredients : []
  const image =
    (chefPizza as { image_url?: string | null }).image_url ??
    (chefPizza as { image?: string | null }).image ??
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop'
  const chefValidUntil = (chefPizza as { chef_valid_until?: string | null }).chef_valid_until

  const handleOptionsAdd = ({ customizations, totalPrice, supplements }: { customizations: string[]; totalPrice: number; supplements: Array<{ id: number; name: string; price: number }> }) => {
    const suppTotal = supplements.reduce((sum, s) => sum + s.price, 0)
    const allCustomizations = [...customizations]
    if (supplements.length > 0) {
      allCustomizations.push(`Suppléments: ${supplements.map(s => s.name).join(', ')}`)
    }
    addItem({ id, name, price: totalPrice + suppTotal, image, category: 'Du Chef', customizations: allCustomizations })
    setOptionsOpen(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
  }

  const slug = chefPizza.slug || generateSlug(chefPizza.name)

  return (
    <>
      {blockReason === 'monday' && <OrderingComingSoonModal onClose={() => setBlockReason(null)} />}
      <PizzaOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        pizza={{ id, name, price, category: 'Du Chef', image }}
        onAdd={handleOptionsAdd}
      />
      <section className="py-24 sm:py-28 px-4 sm:px-6 relative overflow-hidden" aria-labelledby="chef-creation-title">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-primary/[0.06] rounded-full blur-[100px] pointer-events-none" aria-hidden />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/50 bg-white/50 shadow-[0_32px_64px_-12px_rgba(61,36,24,0.08)] backdrop-blur-2xl max-md:bg-white/92 p-8 sm:p-10 md:p-12"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" aria-hidden />

            {/* Badge premium — sobre, contraste OK */}
            <div className="absolute top-0 right-0 z-10 flex items-center gap-2 rounded-bl-2xl border-b border-l border-amber-200/50 bg-amber-50/95 px-5 py-2.5 shadow-sm backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-700/80 shrink-0" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800/90">Édition limitée</span>
            </div>

            {/* Grille : colonne image plus large (≈55%) pour mettre la photo en avant */}
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-[400px] sm:max-w-[440px] mx-auto lg:mx-0 lg:max-w-none"
              >
                <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden />
                <div className="relative aspect-square rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden border border-white/40 shadow-[0_20px_50px_-12px_rgba(61,36,24,0.15)]">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 400px, (max-width: 1024px) 440px, 55vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" aria-hidden />
                </div>
                <div className="absolute -bottom-3 -right-3 z-10 rounded-2xl border border-white/60 bg-white/95 px-5 py-2.5 shadow-lg backdrop-blur-sm">
                  <p className="font-playfair text-2xl font-bold tracking-tight text-[#3D2418]">{price}€</p>
                </div>
              </motion.div>

              <div className="flex flex-col gap-7">
                <div>
                  <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#3D2418]/60 mb-4">
                    <span className="h-px w-8 bg-primary/40" aria-hidden />
                    Création du chef
                  </p>
                  <h2 id="chef-creation-title" className="font-playfair text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[#3D2418] leading-[1.15] tracking-tight mb-5">
                    {name}
                  </h2>

                  {chefValidUntil && (
                    <div className="mb-6">
                      <ChefValidUntilTimer validUntil={chefValidUntil} variant="premium" />
                    </div>
                  )}

                  <p className="text-[#3D2418]/75 text-base sm:text-lg leading-relaxed mb-7 font-normal max-w-xl">
                    {description}
                  </p>

                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3D2418]/70">
                      <Pizza size={16} className="text-primary/80 shrink-0" aria-hidden />
                      Ingrédients
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ingredients.slice(0, 6).map((ing, i) => (
                        <span
                          key={i}
                          className="px-3.5 py-1.5 rounded-lg border border-[#3D2418]/12 bg-[#3D2418]/[0.05] text-[#3D2418] font-medium text-sm"
                        >
                          {ing}
                        </span>
                      ))}
                      {ingredients.length > 6 && (
                        <span className="self-center text-xs font-medium text-[#3D2418]/50 pl-1">+{ingredients.length - 6}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href={slug ? `/menu/${slug}` : '/menu'} className="w-full sm:w-auto min-h-[48px] flex">
                    <Button
                      variant="outline"
                      className="w-full min-h-[48px] border-2 border-[#3D2418]/15 text-[#3D2418] hover:bg-[#3D2418]/5 py-4 px-6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      size="md"
                    >
                      Détails
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      if (!price) return
                      const reason = orderingBlockReason()
                      if (reason) {
                        setBlockReason(reason)
                        return
                      }
                      setOptionsOpen(true)
                    }}
                    className="min-h-[48px] flex-grow py-4 text-base shadow-lg shadow-primary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    size="md"
                    icon={<ShoppingBag size={20} aria-hidden />}
                  >
                    Commander l&apos;exclu
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
