'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { adminHeadingSm, adminSectionLabel } from '../adminUi'

export function AdminSectionHeader({
  label,
  title,
  icon: Icon,
  action,
  className,
}: {
  label?: string
  title: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {label ? (
          <p className={cn(adminSectionLabel, 'mb-1')}>{label}</p>
        ) : null}
        <h3
          className={cn(
            adminHeadingSm,
            'flex flex-wrap items-center gap-2 text-lg font-bold md:text-xl'
          )}
        >
          {Icon ? (
            <Icon
              className="h-5 w-5 shrink-0 text-coral"
              strokeWidth={2}
              aria-hidden
            />
          ) : null}
          {title}
        </h3>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
