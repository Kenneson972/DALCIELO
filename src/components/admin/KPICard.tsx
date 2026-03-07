'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

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
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    trend: 'bg-blue-100 text-blue-700',
  },
  green: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: 'text-emerald-500',
    trend: 'bg-emerald-100 text-emerald-700',
  },
  orange: {
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: 'text-orange-500',
    trend: 'bg-orange-100 text-orange-700',
  },
  red: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    icon: 'text-red-500',
    trend: 'bg-red-100 text-red-700',
  },
  purple: {
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    icon: 'text-purple-500',
    trend: 'bg-purple-100 text-purple-700',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${styles.bg} ${styles.icon}`}>
          <Icon size={22} />
        </div>
        {trend && !loading && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${
            trend.value >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <span>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        
        {loading ? (
          <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
        ) : (
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        )}
        
        {trend && !loading && (
          <p className="text-xs text-slate-400 mt-1">{trend.label}</p>
        )}
      </div>
    </motion.div>
  )
}
