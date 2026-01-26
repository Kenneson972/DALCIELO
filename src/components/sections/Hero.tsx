'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Pizza } from 'lucide-react'
import Link from 'next/link'

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Tropical Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-lighter/10 rounded-full blur-3xl" />
        
        {/* Abstract tropical leaves pattern (simulated with SVGs or divs) */}
        <div className="absolute top-1/4 right-10 opacity-10 rotate-45 hidden lg:block">
          <Pizza size={200} className="text-primary" />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Une toute nouvelle carte !
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-display font-black text-dark leading-tight mb-8">
            Des pizzas qui <br />
            <span className="text-transparent bg-clip-text bg-gradient-primary">
              touchent le ciel
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-text max-w-lg mb-10 leading-relaxed">
            Découvrez l&apos;authenticité de la pizza artisanale à Bellevue, Fort-de-France. 
            Des ingrédients frais, une pâte travaillée avec amour et un goût inoubliable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/menu">
              <Button size="lg" className="w-full sm:w-auto">
                Découvrir le menu <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/customize">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Personnaliser ma pizza
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-cream flex items-center justify-center overflow-hidden">
                   <img 
                    src={`https://i.pravatar.cc/100?u=${i}`} 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                   />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex text-yellow-500 mb-1">
                {'★'.repeat(5)}
              </div>
              <p className="font-bold text-dark">5.0 sur TripAdvisor</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Main Hero Image Placeholder */}
          <div className="relative z-10 w-full aspect-square max-w-[500px] mx-auto">
            <div className="absolute inset-0 bg-gradient-tropical rounded-full opacity-20 blur-3xl" />
            <div className="relative w-full h-full rounded-full overflow-hidden border-8 border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop" 
                alt="Pizza dal Cielo Signature"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-10 glass p-4 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <div className="bg-primary p-2 rounded-lg">
                <Pizza className="text-white" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-text font-bold uppercase">Best Seller</p>
                <p className="text-sm font-black">Pizza du Chef</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 -right-10 glass p-4 rounded-2xl shadow-xl"
            >
              <p className="text-primary font-black text-2xl">100%</p>
              <p className="text-xs text-gray-text font-bold uppercase">Artisanal</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
