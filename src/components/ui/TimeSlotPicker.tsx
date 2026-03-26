'use client'

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import {
  PREFERRED_TIME_SLOTS,
  formatPreferredTimeLabel,
  isPreferredTimeSlotObsolete,
} from '@/lib/preferredTimeSlots'

export type TimeSlotPickerProps = {
  value: string
  onChange: (time: string) => void
  disabled?: boolean
}

/**
 * Sélecteur de créneau horaire (pattern listbox / combobox custom).
 * — Karibloom: cibles tactiles ≥44px, focus visible, clavier Escape, reduced-motion.
 */
export function TimeSlotPicker({ value, onChange, disabled = false }: TimeSlotPickerProps) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const uid = useId().replace(/:/g, '')
  const labelId = `slot-label-${uid}`
  const listId = `slot-list-${uid}`

  const allPast = PREFERRED_TIME_SLOTS.every(t => isPreferredTimeSlotObsolete(t))
  const firstAvailable = PREFERRED_TIME_SLOTS.find(t => !isPreferredTimeSlotObsolete(t))

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  const duration = reduceMotion ? 0.01 : 0.18

  return (
    <div ref={rootRef} className="relative space-y-2">
      <label
        id={labelId}
        htmlFor={`${listId}-trigger`}
        className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1 block"
      >
        Heure souhaitée
      </label>

      <button
        ref={triggerRef}
        id={`${listId}-trigger`}
        type="button"
        disabled={disabled || allPast}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? `${listId}-panel` : undefined}
        aria-labelledby={labelId}
        className={`w-full flex items-center justify-between gap-3 min-h-[52px] px-4 py-3 rounded-2xl border text-left transition-colors touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
          disabled || allPast
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            : open
              ? 'border-primary/50 bg-cream/40 text-[#3D2418] shadow-sm'
              : 'border-gray-200 bg-white text-[#3D2418] hover:border-primary/30 hover:bg-cream/20'
        }`}
        onClick={() => {
          if (disabled || allPast) return
          setOpen(o => !o)
        }}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock size={20} strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-tight truncate">
              {allPast
                ? 'Créneaux épuisés ce soir'
                : value
                  ? formatPreferredTimeLabel(value)
                  : 'Choisir une heure'}
            </span>
            {!allPast && (
              <span className="block text-[11px] font-medium text-gray-400 mt-0.5">
                Heure de la Martinique
              </span>
            )}
          </span>
        </span>
        <span className="shrink-0 text-gray-400" aria-hidden>
          {open ? <ChevronUp size={22} strokeWidth={2} /> : <ChevronDown size={22} strokeWidth={2} />}
        </span>
      </button>

      <AnimatePresence>
        {open && !allPast && (
          <motion.div
            id={`${listId}-panel`}
            role="listbox"
            aria-label="Créneaux disponibles"
            initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={{ duration, ease: 'easeOut' }}
            className="absolute z-[120] left-0 right-0 mt-1 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-black/[0.08] p-3 max-h-[min(340px,52vh)] overflow-y-auto overscroll-contain"
          >
            <div className="grid grid-cols-3 gap-2">
              {PREFERRED_TIME_SLOTS.map(time => {
                const obsolete = isPreferredTimeSlotObsolete(time)
                const selected = value === time
                const isNextSuggested = !obsolete && firstAvailable === time && !value
                return (
                  <button
                    key={time}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-disabled={obsolete}
                    disabled={obsolete}
                    title={
                      obsolete
                        ? 'Ce créneau est déjà passé (Martinique).'
                        : `Choisir ${formatPreferredTimeLabel(time)}`
                    }
                    onClick={() => {
                      if (obsolete) return
                      onChange(time)
                      setOpen(false)
                      triggerRef.current?.focus()
                    }}
                    className={`flex flex-col items-center justify-center gap-0.5 min-h-[52px] px-1 rounded-xl text-sm font-bold border transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-inset ${
                      obsolete
                        ? 'border-transparent bg-gray-50 text-gray-300 cursor-not-allowed'
                        : selected
                          ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                          : isNextSuggested
                            ? 'border-primary/35 bg-primary/5 text-primary hover:bg-primary/10'
                            : 'border-gray-100 bg-gray-50/80 text-gray-700 hover:border-primary/25 hover:bg-cream/40'
                    }`}
                  >
                    <span>{formatPreferredTimeLabel(time)}</span>
                    {isNextSuggested && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary/90 leading-none">
                        Suggéré
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {allPast && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 leading-snug">
          Tous les créneaux affichés sont passés pour aujourd&apos;hui. Appelez la pizzeria ou réessayez plus tard.
        </p>
      )}
    </div>
  )
}
