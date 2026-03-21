'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { PizzaCard } from '@/components/menu/PizzaCard'
import { CategoryFilter } from '@/components/menu/CategoryFilter'
import { Button } from '@/components/ui/Button'
import { Pizza, Search, Sparkles, ShoppingBag } from 'lucide-react'
import { generateSlug } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { PizzaOptionsModal } from '@/components/menu/PizzaOptionsModal'

export interface MenuPageItem {
  id: number
  name: string
  price: number | null
  type: string // 'Pizza' | 'Friand' | 'Drink'
  category?: string
  ingredients?: string[]
  description?: string
  image?: string
  popular?: boolean
  vegetarian?: boolean
  premium?: boolean
  /** Si true, le client peut choisir une sauce après cuisson (Ketchup, Barbecue, etc.). Source : CSV Variante 2. */
  sauceAuChoix?: boolean
  slug?: string
  varianteChoix?: { count: number; options: string[] }
  extraBases?: { id: number; name: string; price: number }[]
}

// Catégories calculées dynamiquement depuis les items réels (see MenuPageClient)

const DISPLAY_ORDER: Record<string, number> = {
  'Du Chef': 0,
  'Classique': 1,
  'Friands': 2,
  'Desserts': 3,
  'Boissons': 4,
}

function sortItemsPizzasFirst(items: MenuPageItem[]): MenuPageItem[] {
  return [...items].sort((a, b) => {
    const catA = a.type === 'Drink' ? 'Boissons' : a.type === 'Friand' ? 'Friands' : a.type === 'Dessert' ? 'Desserts' : (a.category ?? '')
    const catB = b.type === 'Drink' ? 'Boissons' : b.type === 'Friand' ? 'Friands' : b.type === 'Dessert' ? 'Desserts' : (b.category ?? '')
    const orderA = DISPLAY_ORDER[catA] ?? 2
    const orderB = DISPLAY_ORDER[catB] ?? 2
    return orderA - orderB
  })
}

function ChefPizzaBigCard({ item }: { item: MenuPageItem }) {
  const { addItem } = useCart()
  const [optionsOpen, setOptionsOpen] = useState(false)
  const slug = item.slug ?? generateSlug(item.name)
  const img = item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop'

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (item.price != null) setOptionsOpen(true)
  }

  const handleOptionsAdd = ({ customizations, totalPrice }: { customizations: string[]; totalPrice: number }) => {
    addItem({
      id: item.id,
      name: item.name,
      price: totalPrice,
      image: item.image,
      category: 'Du Chef',
      customizations,
    })
  }

  return (
    <>
      <PizzaOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        pizza={{ id: item.id, name: item.name, price: item.price ?? 0, category: 'Du Chef', image: item.image }}
        onAdd={handleOptionsAdd}
      />
      <Link href={`/menu/${slug}`} className="block group">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/45 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 max-lg:bg-white/92 max-lg:backdrop-blur-none max-lg:border-white/55"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[320px]">
          <div className="relative h-64 lg:h-auto lg:min-h-[320px]">
            <Image
              src={img}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent lg:from-black/30" />
            <div className="absolute bottom-4 left-4 right-4 lg:left-6 lg:bottom-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 px-3 py-1.5 rounded-full text-sm font-black uppercase tracking-wider">
                <Sparkles size={14} /> Du Chef
              </span>
              {item.premium && (
                <span className="inline-flex bg-white/90 text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold">Premium</span>
              )}
            </div>
          </div>
          <div className="p-8 lg:p-10 flex flex-col justify-center lg:bg-white/40 lg:backdrop-blur-md lg:border-l lg:border-white/40 max-lg:border-t max-lg:border-white/50">
            <h2 className="text-3xl lg:text-4xl font-black text-[#2c1a12] mb-2 group-hover:text-primary transition-colors">{item.name}</h2>
            <p className="text-[#2c1a12]/85 mb-6 line-clamp-3 leading-relaxed">
              {item.ingredients?.length ? item.ingredients.join(', ') : item.description || 'Création exclusive du Chef, change tous les 15 jours.'}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {item.price != null && (
                <span className="text-2xl font-black text-primary">{item.price}€</span>
              )}
              <Button onClick={handleAdd} variant="primary" size="md" icon={<ShoppingBag size={18} />} disabled={!item.price}>
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
    </>
  )
}

export function MenuPageClient({ items }: { items: MenuPageItem[] }) {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')

  // Catégories visibles : on/off automatique selon les items présents
  const visibleCategories = useMemo(() => {
    const cats: string[] = ['Classiques']
    if (items.some(i => i.category === 'Du Chef'))  cats.push('Pizzas du Chef')
    if (items.some(i => i.type === 'Friand'))        cats.push('Friands')
    if (items.some(i => i.type === 'Dessert'))       cats.push('Desserts')
    if (items.some(i => i.type === 'Drink'))         cats.push('Boissons')
    return cats
  }, [items])

  const filteredItems = useMemo(() => {
    const list = items.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.ingredients?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
      if (!matchesSearch) return false
      if (activeCategory === 'Tous') return true
      if (activeCategory === 'Classiques') return item.category === 'Classique'
      if (activeCategory === 'Pizzas du Chef') return item.category === 'Du Chef'
      if (activeCategory === 'Friands') return item.type === 'Friand'
      if (activeCategory === 'Végétariennes') return item.vegetarian === true
      if (activeCategory === 'Desserts') return item.type === 'Dessert'
      if (activeCategory === 'Boissons') return item.type === 'Drink'
      return true
    })
    return sortItemsPizzasFirst(list)
  }, [items, activeCategory, searchQuery])

  const chefItems = useMemo(() => filteredItems.filter(i => i.category === 'Du Chef'), [filteredItems])
  const restItems = useMemo(() => filteredItems.filter(i => i.category !== 'Du Chef'), [filteredItems])

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-14 max-w-3xl mx-auto rounded-[1.75rem] border border-white/50 bg-white/75 backdrop-blur-md px-6 py-8 sm:px-8 shadow-sm max-md:backdrop-blur-none max-md:bg-white/92">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/12 text-primary px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-4"
          >
            Fait Maison
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-[#2c1a12]">Notre <span className="text-primary">Carte</span></h1>
          <p className="text-[#2c1a12]/88 text-lg max-w-2xl mx-auto leading-relaxed">
            Découvrez notre sélection complète de pizzas artisanales, friands savoureux et boissons fraîches.
            Des recettes classiques aux créations signatures du Chef.
          </p>
        </div>

        {/* Recherche + filtres — léger verre, pas de mega-bloc page entière (kb-ui-ux-pro-max) */}
        <div className="mb-12 rounded-2xl border border-white/40 bg-white/55 backdrop-blur-md max-md:bg-white/92 px-4 py-6 sm:px-6 sm:py-8 shadow-sm">
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden />
            <input
              type="search"
              placeholder="Rechercher une pizza, un ingrédient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[48px] pl-12 pr-6 py-3 rounded-2xl bg-white/90 border border-[#3D2418]/10 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
            />
          </div>
          <CategoryFilter
            categories={visibleCategories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>

        {/* Pizza du Chef – grande case */}
        {chefItems.length > 0 && (
          <div className="mb-14">
            <h2 className="text-2xl font-black text-[#2c1a12] mb-6 flex items-center gap-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
              <Sparkles className="text-primary shrink-0" size={28} aria-hidden />
              Pizza du Chef
            </h2>
            <div className="space-y-6">
              {chefItems.map((item) => (
                <ChefPizzaBigCard key={`chef-${item.id}`} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Titre grille (pizzas, friands, boissons) */}
        {restItems.length > 0 && (
          <>
            {chefItems.length > 0 && (
              <h2 className="text-xl font-black text-[#2c1a12] mb-6 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">Pizzas, friands, desserts & boissons</h2>
            )}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {restItems.map((item) => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PizzaCard pizza={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-20 rounded-3xl border border-white/50 bg-white/70 backdrop-blur-md px-6 max-md:backdrop-blur-none max-md:bg-white/92">
            <div className="bg-white/80 inline-flex p-6 rounded-full text-[#2c1a12]/25 mb-6 border border-white/60">
              <Pizza size={48} aria-hidden />
            </div>
            <h3 className="text-xl font-bold text-[#2c1a12]">Aucun résultat trouvé</h3>
            <p className="text-[#2c1a12]/70 mt-2">Essayez d&apos;autres mots-clés ou changez de catégorie.</p>
          </div>
        )}

        <div className="mt-24 p-12 bg-dark rounded-[3rem] text-white text-center">
          <h2 className="text-3xl font-black mb-4">Une question ? Appelez-nous !</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Pour toute commande ou information, contactez-nous directement.
          </p>
          <a
            href="tel:+596696887270"
            className="inline-flex items-center justify-center gap-3 bg-white/10 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all"
          >
            Appeler pour commander
          </a>
        </div>
      </div>
    </div>
  )
}
