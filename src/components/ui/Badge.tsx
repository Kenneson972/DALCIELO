import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  text: string
  variant?: 'new' | 'popular' | 'vegetarian' | 'premium'
  className?: string
}

export const Badge = ({ text, variant = 'popular', className }: BadgeProps) => {
  const variants = {
    new: 'bg-green-500 text-white',
    popular: 'bg-primary text-white',
    vegetarian: 'bg-green-200 text-green-800',
    premium: 'bg-yellow-400 text-yellow-900',
  }

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
        variants[variant],
        className
      )}
    >
      {text}
    </span>
  )
}
