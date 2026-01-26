'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { menuData } from '@/data/menuData'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pizza, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

export const MenuHighlight = () => {
  const popularPizzas = menuData.pizzas.filter(p => p.popular).slice(0, 3)
  const { addItem } = useCart()

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl mb-6">Nos pizzas les plus <span className="text-primary">populaires</span></h2>
            <p className="text-gray-text text-lg">
              Chaque pizza est préparée avec une pâte à maturation lente et des ingrédients 
              sélectionnés pour leur qualité exceptionnelle.
            </p>
          </div>
          <Link href="/menu">
            <Button variant="ghost" className="group">
              Voir toute la carte <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularPizzas.map((pizza, index) => (
            <motion.div
              key={pizza.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={(pizza as any).image || "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=800&auto=format&fit=crop"} 
                    alt={pizza.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {pizza.popular && <Badge text="Populaire" variant="popular" />}
                    {(pizza as any).vegetarian && <Badge text="Veggie" variant="vegetarian" />}
                    {(pizza as any).premium && <Badge text="Premium" variant="premium" />}
                  </div>
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black">{pizza.name}</h3>
                    <span className="text-primary font-accent font-bold text-xl">{pizza.price}€</span>
                  </div>
                  <p className="text-gray-text mb-6 line-clamp-2">
                    {pizza.ingredients?.join(', ') || "Ingrédients à découvrir"}
                  </p>
                  <div className="mt-auto flex gap-3">
                    <Button 
                      onClick={() => pizza.price && addItem({ id: pizza.id, name: pizza.name, price: pizza.price, image: (pizza as any).image })}
                      className="flex-grow"
                      icon={<ShoppingBag size={18} />}
                    >
                      Ajouter
                    </Button>
                    <Link href="/menu">
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                        <Pizza size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
