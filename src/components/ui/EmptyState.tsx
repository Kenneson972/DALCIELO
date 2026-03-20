import React from 'react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
}

export function EmptyState({ icon, title, description, ctaLabel, ctaHref, onCtaClick }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="bg-cream inline-flex p-6 rounded-full text-gray-300 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-500 mb-2">{title}</h3>
      {description && <p className="text-gray-400 max-w-sm mx-auto">{description}</p>}
      {ctaLabel && (
        <div className="mt-6">
          {ctaHref ? (
            <a href={ctaHref}>
              <Button variant="outline">{ctaLabel}</Button>
            </a>
          ) : (
            <Button variant="outline" onClick={onCtaClick}>{ctaLabel}</Button>
          )}
        </div>
      )}
    </div>
  )
}
