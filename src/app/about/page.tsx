'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Pizza, Heart, MapPin, Star, History, Target } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: <Pizza className="text-primary" size={32} />,
      title: "Qualité",
      description: "Des ingrédients frais, locaux quand possible, et une pâte pétrie chaque jour."
    },
    {
      icon: <Heart className="text-primary" size={32} />,
      title: "Passion",
      description: "Chaque pizza est une création faite avec amour et attention aux détails."
    },
    {
      icon: <Star className="text-primary" size={32} />,
      title: "Excellence",
      description: "Un service irréprochable et un goût authentique qui nous vaut 5 étoiles."
    }
  ]

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Main content container for readability */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-8 md:p-16 shadow-2xl">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight text-[#3D2418]">
                L&apos;histoire de <br />
                <span className="text-primary">Pizza dal Cielo</span>
              </h1>
              <p className="text-lg text-[#3D2418]/80 leading-relaxed mb-6">
                Tout commence par une vision simple : apporter un peu de &quot;ciel&quot; dans l&apos;assiette des Martiniquais. 
                Fondée en juin 2024 par Guylian Grangenois, Pizza dal Cielo est le fruit d&apos;une passion 
                dévorante pour la gastronomie italienne revisitée avec une touche tropicale.
              </p>
              <p className="text-lg text-[#3D2418]/80 leading-relaxed">
                À seulement 23 ans, Guylian a décidé de lancer sa propre pizzeria artisanale à Bellevue, 
                mettant l&apos;accent sur la qualité des produits et le savoir-faire traditionnel. 
                Aujourd&apos;hui, Pizza dal Cielo est devenue une référence pour les amateurs de vraies pizzas.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=1000&auto=format&fit=crop" 
                  alt="Guylian Grangenois - Fondateur" 
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl hidden md:block border border-gray-100">
                <p className="text-primary font-black text-4xl mb-1">2024</p>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Année de création</p>
              </div>
            </motion.div>
          </div>

          {/* Values Section */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4 text-[#3D2418]">Nos <span className="text-primary">Valeurs</span></h2>
              <p className="text-[#3D2418]/70 max-w-xl mx-auto">Ce qui nous définit et nous motive chaque jour à allumer le four.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-10 h-full text-center hover:border-primary/20 border-2 border-transparent transition-all shadow-lg">
                    <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                      {value.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-[#3D2418]">{value.title}</h3>
                    <p className="text-gray-500 leading-relaxed">
                      {value.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mission/Vision Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-12 bg-dark text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target size={120} />
              </div>
              <h3 className="text-3xl font-black mb-6 flex items-center gap-3">
                <Target className="text-primary" /> Notre Mission
              </h3>
              <p className="text-white/60 text-lg leading-relaxed">
                Offrir une expérience culinaire premium accessible à tous, en célébrant l&apos;art de la pizza 
                artisanale avec des produits d&apos;exception et un service chaleureux.
              </p>
            </Card>
            
            <Card className="p-12 border-2 border-dark overflow-hidden relative group bg-white">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <History size={120} />
              </div>
              <h3 className="text-3xl font-black mb-6 flex items-center gap-3 text-dark">
                <History className="text-primary" /> Notre Vision
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                Devenir la pizzeria de référence en Martinique, reconnue pour son innovation constante 
                et son respect des traditions, tout en restant une entreprise jeune et dynamique.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
