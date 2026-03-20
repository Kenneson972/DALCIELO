'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Pizza, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { PizzaOptionsModal } from '@/components/menu/PizzaOptionsModal'
import { OrderingComingSoonModal } from '@/components/ui/OrderingComingSoonModal'
import { orderingBlockReason } from '@/lib/ordering'
import { cn, generateSlug } from '@/lib/utils'

interface PizzaCardProps {
  pizza: {
    id: number
    name: string
    price: number | null
    ingredients?: string[]
    image?: string
    popular?: boolean
    vegetarian?: boolean
    premium?: boolean
    category?: string
    description?: string
    type?: string
    /** Si true, choix de sauce après cuisson (Ketchup, Barbecue, etc.) */
    sauceAuChoix?: boolean
    /** Slug depuis products (Supabase) — prioritaire pour le lien après modif admin */
    slug?: string
    varianteChoix?: { count: number; options: string[] }
  }
}

export const PizzaCard = ({ pizza }: PizzaCardProps) => {
  const { addItem } = useCart()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [blockReason, setBlockReason] = useState<'monday' | 'sunday' | null>(null)
  const [justAdded, setJustAdded] = useState(false)

  const isPizza = !pizza.type || pizza.type === 'Pizza' || pizza.type === 'Chef'
  const itemCategory =
    pizza.category ||
    (pizza.type === 'Drink' ? 'Boissons' : pizza.type === 'Friand' ? 'Friands' : 'Pizzas')
  const slug = pizza.slug ?? generateSlug(pizza.name)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!pizza.price) return
    const reason = orderingBlockReason()
    if (reason) {
      setBlockReason(reason)
      return
    }
    if (isPizza || pizza.varianteChoix) {
      setOptionsOpen(true)
    } else {
      addItem({
        id: pizza.id,
        name: pizza.name,
        price: pizza.price,
        image: pizza.image,
        category: itemCategory,
      })
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 600)
    }
  }

  const handleOptionsAdd = ({ customizations, totalPrice, supplements }: { customizations: string[]; totalPrice: number; supplements: Array<{ id: number; name: string; price: number }> }) => {
    const suppTotal = supplements.reduce((sum, s) => sum + s.price, 0)
    const allCustomizations = [...customizations]
    if (supplements.length > 0) {
      allCustomizations.push(`Suppléments: ${supplements.map(s => s.name).join(', ')}`)
    }
    addItem({
      id: pizza.id,
      name: pizza.name,
      price: totalPrice + suppTotal,
      image: pizza.image,
      category: itemCategory,
      customizations: allCustomizations,
    })
  }

  return (
    <>
      {blockReason && <OrderingComingSoonModal reason={blockReason} onClose={() => setBlockReason(null)} />}
      <PizzaOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        pizza={{ id: pizza.id, name: pizza.name, price: pizza.price ?? 0, category: itemCategory, image: pizza.image, sauceAuChoix: pizza.sauceAuChoix, varianteChoix: pizza.varianteChoix }}
        onAdd={handleOptionsAdd}
      />
      <Link href={`/menu/${slug}`} className="block h-full" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
      {/* Glass léger (desktop blur / mobile fond plus opaque — perf kb-performance) */}
      <div
        className={cn(
          'h-full flex flex-col group overflow-hidden cursor-pointer rounded-3xl',
          'border border-white/50 bg-white/75 backdrop-blur-md shadow-md hover:shadow-lg hover:bg-white/82',
          'transition-all duration-300',
          'max-md:backdrop-blur-none max-md:bg-white/93 max-md:border-white/60'
        )}
      >
        <div className="relative h-56 overflow-hidden bg-black/5">
          <Image
            src={pizza.image || (isPizza
              ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop"
              : pizza.type === 'Drink'
                ? "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop"
                : "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?q=80&w=800&auto=format&fit=crop"
            )}
            alt={pizza.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {pizza.popular && <Badge text="Populaire" variant="popular" />}
            {pizza.vegetarian && <Badge text="Veggie" variant="vegetarian" />}
            {pizza.premium && <Badge text="Premium" variant="premium" />}
            {pizza.category === 'Du Chef' && <Badge text="Du Chef" variant="popular" className="bg-amber-400 text-amber-900" />}
          </div>
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <div className="flex justify-between items-start gap-2 mb-3">
            <h3 className="text-xl font-black text-[#2c1a12] group-hover:text-primary transition-colors">{pizza.name}</h3>
            {pizza.price && <span className="text-primary-text font-sans font-bold text-lg whitespace-nowrap">{pizza.price}€</span>}
          </div>
          <p className="text-[#2c1a12]/80 text-sm mb-4 line-clamp-3 leading-relaxed">
            {pizza.ingredients ? pizza.ingredients.join(', ') : pizza.description || (pizza.type === 'Drink' ? 'Bouteille 50cl' : '')}
          </p>
          <div className="mt-auto pt-4 border-t border-[#3D2418]/10 flex items-center justify-between gap-4">
            <Button
              onClick={handleAddToCart}
              variant="primary"
              size="sm"
              className={cn("flex-grow text-xs transition-transform", justAdded && "scale-110")}
              icon={<ShoppingBag size={14} />}
              disabled={!pizza.price}
            >
              {justAdded ? 'Ajouté !' : 'Ajouter'}
            </Button>
            {isPizza && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#2c1a12]/45 uppercase tracking-widest shrink-0">
                <Pizza size={12} className="text-primary" aria-hidden="true" />
                Artisanal
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
    </>
  )
}
