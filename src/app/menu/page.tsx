'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { menuData } from '@/data/menuData'
import { PizzaCard } from '@/components/menu/PizzaCard'
import { CategoryFilter } from '@/components/menu/CategoryFilter'
import { Button } from '@/components/ui/Button'
import { Pizza, Search } from 'lucide-react'

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')

  const allItems = [
    ...menuData.pizzas.map(p => ({ ...p, type: 'Pizza' })),
    ...menuData.friands.map(f => ({ ...f, type: 'Friand' })),
    ...menuData.drinks.map(d => ({ ...d, type: 'Drink' })),
  ]

  const categories = ['Classiques', 'Signatures', 'Végétariennes', 'Friands', 'Boissons']

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ((item as any).ingredients && (item as any).ingredients.some((i: string) => i.toLowerCase().includes(searchQuery.toLowerCase())))

    if (activeCategory === 'Tous') return matchesSearch
    
    if (activeCategory === 'Classiques') return matchesSearch && (item as any).category === 'Classique'
    if (activeCategory === 'Signatures') return matchesSearch && (item as any).category === 'Signature'
    if (activeCategory === 'Végétariennes') return matchesSearch && (item as any).vegetarian
    if (activeCategory === 'Friands') return matchesSearch && item.type === 'Friand'
    if (activeCategory === 'Boissons') return matchesSearch && item.type === 'Drink'
    
    return matchesSearch
  })

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-cream/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-4"
          >
            Fait Maison
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">Notre <span className="text-primary">Carte</span></h1>
          <p className="text-gray-text text-lg max-w-2xl mx-auto">
            Découvrez notre sélection complète de pizzas artisanales, friands savoureux et boissons fraîches. 
            Des recettes classiques aux créations signatures du Chef.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12">
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher une pizza, un ingrédient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-primary/20 focus:outline-none shadow-sm transition-all"
            />
          </div>
          
          <CategoryFilter 
            categories={categories} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
          />
        </div>

        {/* Menu Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredItems.map((item: any) => (
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

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white inline-flex p-6 rounded-full text-gray-300 mb-6">
              <Pizza size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-500">Aucun résultat trouvé</h3>
            <p className="text-gray-400 mt-2">Essayez d&apos;autres mots-clés ou changez de catégorie.</p>
          </div>
        )}

        <div className="mt-24 p-12 bg-dark rounded-[3rem] text-white text-center">
          <h2 className="text-3xl font-black mb-4">Envie de personnaliser ?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Vous pouvez composer votre pizza en choisissant votre base, votre sauce et vos garnitures préférées. 
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/customize">
              <Button className="w-full sm:w-auto py-4 px-10 text-lg">
                Créer ma Pizza
              </Button>
            </Link>
            <a href="tel:+596696887270" className="inline-flex items-center justify-center gap-3 bg-white/10 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all">
              Appeler pour commander
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
