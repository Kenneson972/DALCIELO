'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Instagram, ArrowUpRight } from 'lucide-react'
import { contactInfo } from '@/data/menuData'

export const GallerySection = () => {
  const images = [
    "https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop"
  ]

  return (
    <section className="py-24 px-6 bg-cream/50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl mb-6">Suivez nos <span className="text-primary">aventures</span></h2>
            <p className="text-gray-text text-lg">Retrouvez nos dernières créations et l&apos;ambiance de la pizzeria sur Instagram.</p>
          </div>
          <a 
            href={contactInfo.socials.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-bold text-primary group"
          >
            @pizza_dal_cielo <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-lg"
            >
              <img 
                src={img} 
                alt={`Pizza dal Cielo gallery ${i}`}
                className="w-full transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white p-4 rounded-full text-primary scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Instagram size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
