'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export const CategoryFilter = ({ 
  categories, 
  activeCategory, 
  setActiveCategory 
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-2">
      <button
        type="button"
        onClick={() => setActiveCategory('Tous')}
        className={cn(
          'min-h-[44px] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all',
          activeCategory === 'Tous'
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'bg-white/55 text-[#2c1a12]/90 backdrop-blur-sm border border-white/60 hover:bg-white/80 max-md:bg-white/85 max-md:backdrop-blur-none'
        )}
      >
        Tous
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category}
          onClick={() => setActiveCategory(category)}
          className={cn(
            'min-h-[44px] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all',
            activeCategory === category
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-white/55 text-[#2c1a12]/90 backdrop-blur-sm border border-white/60 hover:bg-white/80 max-md:bg-white/85 max-md:backdrop-blur-none'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
