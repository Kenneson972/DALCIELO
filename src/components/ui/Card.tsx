import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  glass?: boolean
}

export const Card = ({ children, className, glass = false }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-3xl overflow-hidden transition-all duration-300',
        glass ? 'glass' : 'bg-white shadow-sm hover:shadow-xl',
        className
      )}
    >
      {children}
    </div>
  )
}
