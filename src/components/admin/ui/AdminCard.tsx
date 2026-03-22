'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { adminCard } from '../adminUi'

export function AdminCard({
  className,
  padding = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { padding?: boolean }) {
  return (
    <div
      className={cn(adminCard, padding && 'p-5 md:p-6', className)}
      {...props}
    />
  )
}
