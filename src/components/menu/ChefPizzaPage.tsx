'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, Pizza, ShoppingBag, Star, ChefHat, Info, Plus, Clock } from 'lucide-react'
import { MenuItem, MenuItemType } from '@/lib/menuUtils'
import { AddToCartButton } from '@/components/menu/AddToCartButton'
import { Button } from '@/components/ui/Button'
import { ProductDetailTabs } from '@/components/menu/ProductDetailTabs'
import { ProductImageGallery } from '@/components/menu/ProductImageGallery'
import { ChefValidUntilTimer } from '@/components/ui/ChefValidUntilTimer'
import { menuData } from '@/data/menuData'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface ChefPizzaPageProps {
  item: MenuItem & { images?: string[] }
  images: string[]
}

const FloatingElement = ({ delay, x, y, rotate, scale, children }: { delay: number, x: number, y: number, rotate: number, scale: number, children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.2, 0.4, 0.2], 
      scale: [scale, scale * 1.1, scale],
      y: [y, y - 20, y],
      rotate: [rotate, rotate + 15, rotate]
    }}
    transition={{ 
      duration: 6, 
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none select-none z-0"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    {children}
  </motion.div>
)

export function ChefPizzaPage({ item, images }: ChefPizzaPageProps) {
  const [revealed, setRevealed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop'
  const ingredients = item.ingredients || []

  // Upsell logic (same as normal page)
  const upsellItems = [...menuData.drinks.slice(0, 3), ...menuData.friands.slice(0, 2)].map(i => ({
    ...i,
    type: (i.category === 'Boissons' ? 'drink' : 'friand') as MenuItemType,
  }))

  return (
    <div className="min-h-screen bg-[#0f0a05] text-[#FFF8F0] selection:bg-amber-500/30 overflow-x-hidden relative">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-950/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        <FloatingElement delay={0} x={10} y={20} rotate={-15} scale={1}><span className="text-4xl opacity-20">🍅</span></FloatingElement>
        <FloatingElement delay={2} x={85} y={15} rotate={45} scale={1.2}><span className="text-5xl opacity-10">🍃</span></FloatingElement>
        <FloatingElement delay={1} x={15} y={80} rotate={-30} scale={0.9}><span className="text-4xl opacity-15">🍄</span></FloatingElement>
        <FloatingElement delay={3} x={80} y={75} rotate={15} scale={1}><span className="text-5xl opacity-10">🧀</span></FloatingElement>
      </div>

      <div className="page-wrapper relative z-10">
        <div className="pt-28 pb-20 px-4 md:px-6 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-[920px]">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-amber-400/60 hover:text-amber-400 transition-colors mb-6 group font-medium"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              Retour au menu
            </Link>

            {/* Carte Container : Meme structure que la fiche normale */}
            <div
              className="rounded-2xl overflow-hidden border border-white/10"
              style={{
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6), 0 18px 36px -18px rgba(0,0,0,0.4)',
                background: 'rgba(20, 15, 10, 0.8)'
              }}
            >
              {/* Image Gallery (Banner layout) */}
              <ProductImageGallery
                images={images.length ? images : [primaryImage]}
                alt={item.name}
                priority
                layout="banner"
                thumbnailVariant="dark"
                badges={
                  <>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[0.7rem] font-black uppercase tracking-[0.2em] text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg animate-pulse">
                      🌟 Édition Limitée
                    </span>
                    <Badge text="Du Chef" variant="premium" className="bg-white/10 backdrop-blur-md text-white border-white/20" />
                  </>
                }
              />

              {/* Contenu en dessous : Meme disposition que /menu/[slug] */}
              <div
                className="px-6 md:px-10 py-8 md:py-12"
                style={{
                  background: 'rgba(20, 15, 10, 0.4)',
                  backdropFilter: 'blur(40px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(150%)',
                }}
              >
                {/* Timer Exclusif */}
                {item.chef_valid_until && (
                  <div className="mb-10 p-6 bg-gradient-to-br from-amber-500/10 to-orange-600/5 rounded-3xl border border-amber-500/20 relative overflow-hidden group shadow-inner">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                      <Clock size={80} />
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80 mb-4 flex items-center gap-2">
                        <Sparkles size={12} /> Temps restant pour l&apos;exclu
                      </span>
                      <ChefValidUntilTimer validUntil={item.chef_valid_until} variant="dark" />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <p className="text-[0.75rem] font-black uppercase tracking-[0.3em] text-amber-500 mb-2">
                    👨‍🍳 Signature de Guylian
                  </p>
                  <h1 className="font-playfair text-4xl md:text-6xl font-black text-white leading-tight mb-3 drop-shadow-sm">
                    {item.name}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <span className="font-playfair text-5xl md:text-6xl font-black text-amber-500 tracking-tight drop-shadow-xl">
                      {item.price}<span className="text-2xl md:text-3xl align-top ml-1">€</span>
                    </span>
                    <div className="h-8 w-px bg-white/10 mx-2" />
                    <div className="flex text-amber-400/60">
                      {[1, 2, 3, 4, 5].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-lg md:text-xl leading-relaxed text-white/80 mb-10 pl-6 border-l-2 border-amber-500/30 italic font-indie">
                      {item.description}
                    </p>
                  )}

                  {/* Section Ingrédients avec Reveal (Meme layout que fiche normale mais flouté) */}
                  <div className="mb-12">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500/60 mb-6 flex items-center gap-2">
                      <Pizza size={16} /> Secrets de la recette
                    </h3>
                    
                    <div className="relative">
                      <div className={cn(
                        "transition-all duration-1000",
                        !revealed && "blur-2xl opacity-10 pointer-events-none select-none scale-95"
                      )}>
                        <ProductDetailTabs
                          ingredients={ingredients}
                          isPizzaOrFriand={true}
                          className="chef-dark-tabs"
                        />
                      </div>

                      <AnimatePresence>
                        {!revealed && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/20 rounded-3xl backdrop-blur-sm"
                          >
                            <button
                              onClick={() => setRevealed(true)}
                              className="px-10 py-5 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                              <Plus size={24} /> Révéler les ingrédients
                            </button>
                            <p className="text-[10px] font-bold text-amber-500/40 uppercase tracking-widest mt-4">Cliquez pour voir la composition</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mb-12 p-5 bg-amber-500/5 rounded-2xl border border-white/5 flex items-start gap-4">
                    <Info className="text-amber-500 shrink-0 mt-1" size={20} />
                    <p className="text-sm text-white/50 leading-relaxed">
                      Chaque ingrédient est soigneusement sélectionné pour créer une harmonie céleste. Une exclusivité disponible pour une durée limitée.
                    </p>
                  </div>

                  {/* Section Upsell (Identique fiche normale) */}
                  {upsellItems.length > 0 && (
                    <div className="mb-12">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500/60 mb-6 ml-1">
                        Accords parfaits du Chef
                      </h3>
                      <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                        {upsellItems.map((upsell) => (
                          <div 
                            key={upsell.id} 
                            className="flex-shrink-0 w-44 bg-white/5 border border-white/5 rounded-[2rem] p-5 flex flex-col items-center text-center shadow-lg hover:border-amber-500/20 transition-all group"
                          >
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6 shadow-inner">
                              {upsell.type === 'drink' ? '🥤' : '🥐'}
                            </div>
                            <p className="font-bold text-white text-sm leading-tight mb-1 line-clamp-1">{upsell.name}</p>
                            <p className="text-amber-500 font-black text-sm mb-4">{upsell.price.toFixed(2)}€</p>
                            <AddToCartButton 
                              item={upsell} 
                              size="sm" 
                              className="w-full py-2.5 bg-white/10 hover:bg-amber-500 hover:text-black border-none transition-colors rounded-xl text-[10px] font-black" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bouton Ajouter au panier final */}
                  <div className="flex gap-4 items-center mt-10 pt-10 border-t border-white/5">
                    <AddToCartButton
                      item={item}
                      className="flex-1 py-5 rounded-2xl font-black text-lg shadow-[0_20px_50px_rgba(245,158,11,0.2)] hover:shadow-[0_25px_60px_rgba(245,158,11,0.3)] hover:-translate-y-1 transition-all bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white"
                    />
                  </div>
                </div>

                {/* Footer de la fiche : Envie d'autre chose ? */}
                <div className="mt-16 pt-10 border-t border-white/5 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-6">
                    Explorer la carte complète
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/menu">
                      <Button variant="outline" size="lg" className="border-white/10 text-white hover:bg-white/5 px-10 rounded-2xl">
                        Tout le menu
                      </Button>
                    </Link>
                    <Link href="/customize">
                      <Button variant="secondary" size="lg" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 px-10 rounded-2xl">
                        Ma pizza perso
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .chef-dark-tabs .bg-white\/80 {
          background-color: rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          color: rgba(255, 248, 240, 0.7) !important;
          border-radius: 1rem !important;
        }
        .chef-dark-tabs .hover\:bg-white:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #fbbf24 !important;
          border-color: rgba(245, 158, 11, 0.4) !important;
          transform: translateY(-2px) !important;
        }
        .chef-dark-tabs h3 {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
