'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pizza, ArrowRight, ShoppingBag, Sparkles, Star } from 'lucide-react'
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
  const [blockReason, setBlockReason] = useState<'monday' | 'coming_soon' | null>(null)

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
        }
      })
      .catch(() => {})
  }, [])

  if (!chefPizza) return null

  const id = Number((chefPizza as any).menu_id ?? chefPizza.id ?? 0)
  const name = chefPizza.name
  const price = Number(chefPizza.price)
  const description = (chefPizza as any).description ?? "Une recette unique et audacieuse qui change tous les 15 jours."
  const ingredients = (chefPizza as any).ingredients ?? []
  const image = (chefPizza as any).image_url ?? (chefPizza as any).image ?? "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop"

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
      {blockReason && <OrderingComingSoonModal reason={blockReason} onClose={() => setBlockReason(null)} />}
      <PizzaOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        pizza={{ id, name, price, category: 'Du Chef', image }}
        onAdd={handleOptionsAdd}
      />
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white/45 backdrop-blur-2xl rounded-[3rem] p-6 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.08)] border border-white/40 overflow-hidden relative group"
          >
            {/* Top Shine Effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            {/* Badge édition limitée - plus compact */}
            <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-6 py-2.5 rounded-bl-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg z-20 flex items-center gap-2">
              <Sparkles size={14} className="animate-pulse" />
              Édition Limitée
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Image Section - Scaled down */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative max-w-[380px] mx-auto lg:mx-0"
              >
                <div className="absolute inset-0 bg-primary/15 rounded-[2.5rem] blur-2xl group-hover:bg-primary/25 transition-colors duration-700" />
                
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border-[8px] border-white/20 backdrop-blur-md">
                  <img 
                    src={image} 
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/5 pointer-events-none" />
                </div>

                {/* Floating Price Tag - Smaller */}
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 z-30"
                >
                  <p className="text-primary font-black text-2xl tracking-tight">{price}€</p>
                </motion.div>
              </motion.div>

              {/* Content Section - Compacted */}
              <div className="flex flex-col gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-3">
                    <span className="w-6 h-px bg-primary/50" />
                    Création du chef
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-display font-black text-[#3D2418] mb-4 leading-tight drop-shadow-sm">
                    {name}
                  </h2>

                  {(chefPizza as any).chef_valid_until && (
                    <div className="mb-6">
                      <ChefValidUntilTimer validUntil={(chefPizza as any).chef_valid_until} />
                    </div>
                  )}

                  <p className="text-[#3D2418]/70 text-lg leading-relaxed mb-6 font-medium line-clamp-3">
                    {description}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <h3 className="font-bold text-[#3D2418] flex items-center gap-2 text-sm uppercase tracking-widest">
                      <Pizza size={18} className="text-primary" />
                      Ingrédients
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(ingredients) ? ingredients : []).slice(0, 6).map((ing, i) => (
                        <span 
                          key={i} 
                          className="px-4 py-1.5 bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl text-[#3D2418] font-bold text-xs shadow-sm"
                        >
                          {ing}
                        </span>
                      ))}
                      {ingredients.length > 6 && <span className="text-xs text-[#3D2418]/40 font-bold self-center ml-1">+{ingredients.length - 6} autres</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <Button
                    onClick={() => {
                      if (!price) return
                      const reason = orderingBlockReason()
                      if (reason) { setBlockReason(reason); return }
                      setOptionsOpen(true)
                    }}
                    className="flex-grow py-4 text-base shadow-xl shadow-primary/20"
                    size="md"
                    icon={<ShoppingBag size={20} />}
                  >
                    Commander l'exclu
                  </Button>
                  <Link href={slug ? `/menu/${slug}` : "/menu"} className="w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-primary/10 text-primary hover:bg-primary hover:text-white py-4 px-8 backdrop-blur-sm text-sm"
                      size="md"
                    >
                      Détails
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
