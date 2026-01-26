'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pizza, Check, ShoppingBag, ArrowRight, Info } from 'lucide-react'
import { menuData } from '@/data/menuData'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

const TOPPINGS = [
  // Fromages (2€)
  { id: 'mozzarella', name: 'Mozzarella', price: 2, category: 'Fromage' },
  { id: 'emmental', name: 'Emmental', price: 2, category: 'Fromage' },
  { id: 'chevre', name: 'Chèvre', price: 2, category: 'Fromage' },
  { id: 'bleu', name: 'Bleu', price: 2, category: 'Fromage' },
  { id: 'parmesan', name: 'Parmesan', price: 2, category: 'Fromage' },
  
  // Salades (2€)
  { id: 'roquette', name: 'Roquette', price: 2, category: 'Salade' },
  { id: 'mache', name: 'Mâche', price: 2, category: 'Salade' },
  
  // Condiments (2€)
  { id: 'ananas', name: 'Ananas', price: 2, category: 'Condiment' },
  { id: 'champignons', name: 'Champignons', price: 2, category: 'Condiment' },
  { id: 'oeuf', name: 'Oeuf', price: 2, category: 'Condiment' },
  { id: 'oignon_rouge', name: 'Oignon rouge', price: 2, category: 'Condiment' },
  { id: 'oignon_frit', name: 'Oignon frit', price: 2, category: 'Condiment' },
  { id: 'olive', name: 'Olive', price: 2, category: 'Condiment' },
  { id: 'poivron', name: 'Poivron', price: 2, category: 'Condiment' },
  { id: 'pomme_de_terre', name: 'Pomme de terre', price: 2, category: 'Condiment' },
  { id: 'tomate_cerise', name: 'Tomate cerise', price: 2, category: 'Condiment' },
  
  // Viandes (3€)
  { id: 'boeuf', name: 'Boeuf cuisiné', price: 3, category: 'Viande' },
  { id: 'bacon', name: 'Bacon', price: 3, category: 'Viande' },
  { id: 'chorizo', name: 'Chorizo', price: 3, category: 'Viande' },
  { id: 'jambon_fume', name: 'Jambon fumé', price: 3, category: 'Viande' },
  { id: 'merguez', name: 'Merguez', price: 3, category: 'Viande' },
  { id: 'poulet', name: 'Poulet cuisiné', price: 3, category: 'Viande' },
  { id: 'saucisse_fumee', name: 'Saucisse fumée', price: 3, category: 'Viande' },
  
  // Produits de la mer (4€)
  { id: 'crevette', name: 'Crevette', price: 4, category: 'Poisson' },
  { id: 'saumon_fume', name: 'Saumon fumé', price: 4, category: 'Poisson' },
]

export default function CustomizePage() {
  const { addItem } = useCart()
  const [selectedBase, setSelectedBase] = useState(menuData.bases[0])
  const [selectedSauce, setSelectedSauce] = useState(menuData.sauces[0])
  const [selectedToppings, setSelectedToppings] = useState<typeof TOPPINGS>([])
  
  const basePrice = 12 // Prix de base pour une pizza personnalisée
  const totalPrice = basePrice + selectedSauce.price + selectedToppings.reduce((acc, t) => acc + t.price, 0)

  const toggleTopping = (topping: typeof TOPPINGS[0]) => {
    setSelectedToppings(prev => 
      prev.find(t => t.id === topping.id) 
        ? prev.filter(t => t.id !== topping.id)
        : [...prev, topping]
    )
  }

  const handleAddToCart = () => {
    const customPizza = {
      id: Date.now(), // ID unique pour chaque pizza personnalisée
      name: `Pizza Perso (${selectedBase.name}, ${selectedSauce.name})`,
      price: totalPrice,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop"
    }
    addItem(customPizza)
  }

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-cream/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-6">Personnalisez votre <span className="text-primary">Pizza</span></h1>
          <p className="text-gray-text text-lg max-w-2xl mx-auto">
            Créez la pizza de vos rêves en quelques clics. Choisissez votre base, votre sauce et vos garnitures préférées.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Visual Preview (Left) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="relative aspect-square rounded-[3rem] bg-white shadow-2xl overflow-hidden flex items-center justify-center p-12 border-4 border-primary/10">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                  className="relative w-full h-full"
                >
                  <Pizza size="100%" className="text-primary/10" />
                </motion.div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-primary/5 to-transparent">
                   <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-primary/10 shadow-xl">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Votre Création</p>
                      <p className="text-xl font-black text-dark mb-4 leading-tight">
                        {selectedBase.name} + {selectedSauce.name}
                      </p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {selectedToppings.map(t => (
                          <span key={t.id} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {t.name}
                          </span>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-8 p-8 bg-dark rounded-[2.5rem] text-white shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/60 font-bold">Total Estimé</span>
                  <span className="text-3xl font-black text-primary">{totalPrice}€</span>
                </div>
                <Button onClick={handleAddToCart} className="w-full py-4 text-lg" icon={<ShoppingBag size={20} />}>
                  Ajouter au Panier
                </Button>
              </div>
            </div>
          </div>

          {/* Options (Right) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Base Selection */}
            <section>
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">1</span>
                Choisissez votre Base
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {menuData.bases.map((base) => (
                  <button
                    key={base.id}
                    onClick={() => setSelectedBase(base)}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all text-left group",
                      selectedBase.id === base.id 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                        : "border-gray-100 bg-white hover:border-primary/20"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      selectedBase.id === base.id ? "bg-primary text-white" : "bg-cream text-primary"
                    )}>
                      <Check size={20} className={cn(selectedBase.id === base.id ? "opacity-100" : "opacity-0")} />
                    </div>
                    <p className="font-black text-lg mb-1">{base.name}</p>
                    <p className="text-xs text-gray-text font-bold uppercase tracking-widest">Inclus</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Sauce Selection */}
            <section>
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">2</span>
                Choisissez votre Sauce
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuData.sauces.map((sauce) => (
                  <button
                    key={sauce.id}
                    onClick={() => setSelectedSauce(sauce)}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group",
                      selectedSauce.id === sauce.id 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                        : "border-gray-100 bg-white hover:border-primary/20"
                    )}
                  >
                    <div>
                      <p className="font-black text-lg mb-1">{sauce.name}</p>
                      {(sauce as any).description && <p className="text-xs text-gray-text">{(sauce as any).description}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-accent font-black text-primary">+{sauce.price}€</p>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 border-primary mt-2 flex items-center justify-center transition-colors",
                        selectedSauce.id === sauce.id ? "bg-primary text-white" : "bg-transparent text-transparent"
                      )}>
                        <Check size={12} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Toppings Selection */}
            <section>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Ajoutez vos Garnitures
                </h3>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Info size={16} />
                  Mix & Match à volonté
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {TOPPINGS.map((topping) => {
                  const isSelected = selectedToppings.find(t => t.id === topping.id)
                  return (
                    <button
                      key={topping.id}
                      onClick={() => toggleTopping(topping)}
                      className={cn(
                        "p-4 rounded-3xl border-2 transition-all text-center flex flex-col items-center",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                          : "border-gray-100 bg-white hover:border-primary/20"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all",
                        isSelected ? "bg-primary text-white scale-110" : "bg-cream text-primary"
                      )}>
                        {isSelected ? <Check size={24} /> : <Plus size={24} className="text-gray-300" />}
                      </div>
                      <p className="font-bold text-sm mb-1">{topping.name}</p>
                      <p className="text-[10px] text-primary font-black">+{topping.price}€</p>
                    </button>
                  )
                })}
              </div>
            </section>

            <div className="p-8 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 text-center">
              <p className="text-gray-text font-bold mb-4 italic">
                &quot;Votre pizza sera préparée à la commande avec le même soin que nos créations signatures.&quot;
              </p>
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5].map(i => <Pizza key={i} size={16} className="text-primary/30" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Plus({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}
