'use client'

import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_HOUR = 60 * 60 * 1000
const MS_PER_MIN = 60 * 1000

type TimerVariant = 'default' | 'dark'

const variantClasses = {
  default: {
    label: 'text-sm font-semibold text-yellow-900',
    icon: 'text-yellow-700',
    box: 'rounded-lg bg-yellow-200/80 px-3 py-2 border border-yellow-500/50',
    value: 'text-2xl sm:text-3xl font-black tabular-nums text-yellow-900',
    unit: 'text-xs font-bold uppercase text-yellow-800',
    pulse: 'text-yellow-900',
    past: 'text-sm font-semibold text-amber-700',
  },
  dark: {
    label: 'text-sm font-semibold text-[#FFF8F0]',
    icon: 'text-[#E17B5F]',
    box: 'rounded-lg bg-white/10 px-3 py-2 border border-[#E17B5F]/40',
    value: 'text-2xl sm:text-3xl font-black tabular-nums text-[#FFF8F0]',
    unit: 'text-xs font-bold uppercase text-[#FFF8F0]/80',
    pulse: 'text-[#FFF8F0]',
    past: 'text-sm font-semibold text-[#E17B5F]/80',
  },
}

/** Affiche la date de fin de validité et un décompte en direct (jours, heures, minutes, secondes). */
export function ChefValidUntilTimer({
  validUntil,
  variant = 'default',
}: {
  validUntil: string | null
  variant?: TimerVariant
}) {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const c = variantClasses[variant]

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!validUntil || !mounted) return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [validUntil, mounted])

  if (!validUntil || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) return null

  const [y, m, d] = validUntil.split('-').map(Number)
  const endDate = new Date(y, m - 1, d, 23, 59, 59)
  const isPast = endDate.getTime() <= now.getTime()

  const formatDate = () => {
    return endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getParts = () => {
    const diff = endDate.getTime() - now.getTime()
    if (diff <= 0) return null
    const days = Math.floor(diff / MS_PER_DAY)
    const hours = Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR)
    const minutes = Math.floor((diff % MS_PER_HOUR) / MS_PER_MIN)
    const seconds = Math.floor((diff % MS_PER_MIN) / 1000)
    return { days, hours, minutes, seconds }
  }

  const parts = getParts()

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex flex-wrap items-center gap-2 ${c.label}`}>
        <Clock size={18} className={`${c.icon} shrink-0`} />
        <span>Disponible jusqu&apos;au {formatDate()}</span>
      </div>
      {mounted && !isPast && parts && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className={`flex items-baseline gap-1 ${c.box}`}>
            <span className={c.value}>{String(parts.days).padStart(2, '0')}</span>
            <span className={c.unit}>j</span>
          </div>
          <div className={`flex items-baseline gap-1 ${c.box}`}>
            <span className={c.value}>{String(parts.hours).padStart(2, '0')}</span>
            <span className={c.unit}>h</span>
          </div>
          <div className={`flex items-baseline gap-1 ${c.box}`}>
            <span className={c.value}>{String(parts.minutes).padStart(2, '0')}</span>
            <span className={c.unit}>min</span>
          </div>
          <div className={`flex items-baseline gap-1 ${c.box}`}>
            <span className={`${c.value} ${c.pulse} animate-[pulse_1s_ease-in-out_infinite]`}>
              {String(parts.seconds).padStart(2, '0')}
            </span>
            <span className={c.unit}>s</span>
          </div>
        </div>
      )}
      {mounted && isPast && <span className={c.past}>(offre terminée)</span>}
    </div>
  )
}
