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
    <div className="flex flex-wrap justify-center gap-2 mb-12">
      <button
        onClick={() => setActiveCategory('Tous')}
        className={cn(
          "px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all",
          activeCategory === 'Tous' 
            ? "bg-primary text-white shadow-lg shadow-primary/30" 
            : "bg-white text-gray-text hover:bg-cream border border-gray-100"
        )}
      >
        Tous
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all",
            activeCategory === category 
              ? "bg-primary text-white shadow-lg shadow-primary/30" 
              : "bg-white text-gray-text hover:bg-cream border border-gray-100"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
