'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const AboutSection = () => {
  const features = [
    "Pâte artisanale longue maturation",
    "Produits frais et de saison",
    "Savoir-faire traditionnel",
    "Ambiance tropicale et chaleureuse"
  ]

  return (
    <section className="py-24 px-6 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Image
                src="https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=600&auto=format&fit=crop"
                alt="Cuisson pizza"
                width={600}
                height={256}
                className="rounded-3xl w-full h-64 object-cover shadow-lg"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <Image
                src="https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=600&auto=format&fit=crop"
                alt="Pizza fraîche"
                width={600}
                height={320}
                className="rounded-3xl w-full h-80 object-cover shadow-lg"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4 pt-12"
            >
              <Image
                src="https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=600&auto=format&fit=crop"
                alt="Ingrédients"
                width={600}
                height={320}
                className="rounded-3xl w-full h-80 object-cover shadow-lg"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <a
                href="https://www.tripadvisor.fr/Restaurant_Review-g147328-d28103311-Reviews-Pizza_Dal_Cielo-Fort_de_France_Arrondissement_of_Fort_de_France_Martinique.html"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-primary p-8 rounded-3xl text-white shadow-xl hover:opacity-95 transition-opacity"
              >
                <p className="text-2xl font-black mb-2">Avis TripAdvisor</p>
                <p className="font-bold opacity-80 uppercase text-xs tracking-widest">Voir les avis</p>
              </a>
            </motion.div>
          </div>
          
          {/* Tropical decoration */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl z-0" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl mb-8 leading-tight">
            L&apos;art de la pizza <br />
            <span className="text-primary">traditionnelle</span> en Martinique
          </h2>
          <p className="text-gray-text text-lg mb-8 leading-relaxed">
            Ouverte en juin 2024 par Guylian Grangenois, Pizza dal Cielo est née d&apos;une passion 
            pour l&apos;artisanat et le goût authentique. Situés à Bellevue, nous mettons tout notre 
            cœur dans la création de pizzas qui vous feront voyager.
          </p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 font-bold text-dark/80">
                <CheckCircle2 className="text-primary" size={20} />
                {feature}
              </li>
            ))}
          </ul>
          
          <Link href="/about">
            <Button size="lg">Notre Histoire</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
