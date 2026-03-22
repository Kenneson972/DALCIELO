'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminCard } from '@/components/admin/adminUi'

interface KPICardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    label: string
  }
  icon: LucideIcon
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  loading?: boolean
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
  },
  purple: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
  },
}

export function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  color = 'blue',
  loading = false,
}: KPICardProps) {
  const styles = colorStyles[color]
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
      className={cn(
        adminCard,
        'border-slate-200/90 p-5 transition-shadow duration-200 hover:shadow-md md:p-6'
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            styles.bg,
            styles.icon
          )}
        >
          <Icon size={22} strokeWidth={2} aria-hidden />
        </div>
        {trend && !loading && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold tabular-nums',
              trend.value >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            )}
          >
            <span>
              {trend.value >= 0 ? '+' : ''}
              {trend.value}%
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-slate-500">{title}</p>

        {loading ? (
          <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <p className={cn('text-3xl font-bold tabular-nums tracking-tight text-slate-900')}>
            {value}
          </p>
        )}

        {trend && !loading && (
          <p className="mt-1 text-xs font-medium text-slate-400">{trend.label}</p>
        )}
      </div>
    </motion.div>
  )
}
