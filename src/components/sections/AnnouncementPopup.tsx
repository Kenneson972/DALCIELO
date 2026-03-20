'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import type { Popup } from '@/types/popup'
import { ChefValidUntilTimer } from '@/components/ui/ChefValidUntilTimer'

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isDismissed(popup: Popup): boolean {
  if (typeof window === 'undefined') return false
  if (popup.dismiss_mode === 'once_session') {
    return Boolean(sessionStorage.getItem(`popup_seen_${popup.id}`))
  }
  // once_daily
  return localStorage.getItem(`popup_dismissed_${popup.id}`) === getTodayStr()
}

function markDismissed(popup: Popup): void {
  if (popup.dismiss_mode === 'once_session') {
    sessionStorage.setItem(`popup_seen_${popup.id}`, '1')
  } else {
    localStorage.setItem(`popup_dismissed_${popup.id}`, getTodayStr())
  }
}

// ─── Chef layout (dark, orange) ────────────────────────────────────────────────

function ChefLayout({ popup, onClose }: { popup: Popup; onClose: () => void }) {
  const router = useRouter()

  const handleCta = () => {
    onClose()
    if (popup.cta_url) router.push(popup.cta_url)
  }

  return (
    <div
      className="relative w-full overflow-hidden flex flex-col sm:flex-row"
      style={{ maxWidth: 780, maxHeight: '90vh', borderRadius: 4, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <CloseButton onClose={onClose} color="#fff" />

      {/* Left — Photo */}
      <div className="relative sm:w-[48%] h-56 sm:h-auto flex-shrink-0 overflow-hidden bg-[#2D1508]">
        {popup.image_url ? (
          <Image
            src={popup.image_url}
            alt={popup.title}
            fill
            sizes="(max-width: 640px) 100vw, 48vw"
            className="object-cover"
            style={{ filter: 'brightness(0.92) saturate(1.1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🍕</div>
        )}
        <div className="absolute inset-y-0 right-0 w-16 hidden sm:block" style={{ background: 'linear-gradient(to right, transparent, #110804)' }} />
        <div className="absolute inset-x-0 bottom-0 h-16 sm:hidden" style={{ background: 'linear-gradient(to bottom, transparent, #110804)' }} />
      </div>

      {/* Right — Content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:py-14" style={{ background: '#110804' }}>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-5" style={{ color: '#E17B5F' }}>
          {popup.subtitle || 'Pizza du Chef · Édition Limitée'}
        </p>
        <div className="w-8 h-px mb-6" style={{ background: '#E17B5F', opacity: 0.5 }} />
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4" style={{ color: '#FFF8F0', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.01em' }}>
          {popup.title}
        </h2>
        {popup.message && (
          <p className="text-sm leading-relaxed mb-6 line-clamp-3" style={{ color: 'rgba(255,248,240,0.55)', maxWidth: 300 }}>
            {popup.message}
          </p>
        )}
        {popup.price != null && (
          <div className="mb-4">
            <span className="text-4xl font-black" style={{ color: '#FFF8F0', fontFamily: 'Poppins, sans-serif' }}>
              {popup.price.toFixed(2)}&thinsp;€
            </span>
          </div>
        )}
        {popup.expires_at && (
          <div className="mb-8">
            <ChefValidUntilTimer validUntil={popup.expires_at} variant="dark" />
          </div>
        )}
        {popup.cta_label && (
          <button
            onClick={handleCta}
            className="w-full py-4 text-sm font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-85 active:opacity-70 mb-4"
            style={{ background: 'linear-gradient(135deg, #E17B5F 0%, #C4522A 100%)', color: '#fff', borderRadius: 2 }}
          >
            {popup.cta_label}
          </button>
        )}
        <button
          onClick={onClose}
          className="text-xs text-center transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,248,240,0.28)', letterSpacing: '0.05em' }}
        >
          Pas maintenant
        </button>
      </div>
    </div>
  )
}

// ─── Promo layout (emerald green) ──────────────────────────────────────────────

function PromoLayout({ popup, onClose }: { popup: Popup; onClose: () => void }) {
  const router = useRouter()

  const handleCta = () => {
    onClose()
    if (popup.cta_url) router.push(popup.cta_url)
  }

  return (
    <div
      className="relative w-full overflow-hidden flex flex-col sm:flex-row"
      style={{ maxWidth: 680, maxHeight: '90vh', borderRadius: 4, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', background: '#0a2e1a' }}
      onClick={(e) => e.stopPropagation()}
    >
      <CloseButton onClose={onClose} color="#fff" />

      {popup.image_url && (
        <div className="relative sm:w-[44%] h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <Image src={popup.image_url} alt={popup.title} fill sizes="(max-width: 640px) 100vw, 44vw" className="object-cover" style={{ filter: 'brightness(0.88) saturate(1.15)' }} />
          <div className="absolute inset-y-0 right-0 w-16 hidden sm:block" style={{ background: 'linear-gradient(to right, transparent, #0a2e1a)' }} />
          <div className="absolute inset-x-0 bottom-0 h-14 sm:hidden" style={{ background: 'linear-gradient(to bottom, transparent, #0a2e1a)' }} />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:py-12">
        {popup.subtitle && (
          <span className="inline-block self-start text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1 rounded-full mb-5" style={{ background: '#22c55e', color: '#fff' }}>
            {popup.subtitle}
          </span>
        )}
        <div className="w-8 h-px mb-5" style={{ background: '#22c55e', opacity: 0.6 }} />
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4" style={{ color: '#f0fdf4', fontFamily: 'Poppins, sans-serif' }}>
          {popup.title}
        </h2>
        {popup.message && (
          <p className="text-sm leading-relaxed mb-6 line-clamp-3" style={{ color: 'rgba(240,253,244,0.6)', maxWidth: 300 }}>
            {popup.message}
          </p>
        )}
        {popup.expires_at && (
          <p className="text-xs mb-6" style={{ color: 'rgba(240,253,244,0.45)', letterSpacing: '0.05em' }}>
            Jusqu&apos;au {new Date(popup.expires_at + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </p>
        )}
        {popup.cta_label && (
          <button
            onClick={handleCta}
            className="w-full py-4 text-sm font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-85 active:opacity-70 mb-4"
            style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff', borderRadius: 2 }}
          >
            {popup.cta_label}
          </button>
        )}
        <button onClick={onClose} className="text-xs text-center transition-opacity hover:opacity-70" style={{ color: 'rgba(240,253,244,0.28)' }}>
          Pas maintenant
        </button>
      </div>
    </div>
  )
}

// ─── Event layout (indigo) ─────────────────────────────────────────────────────

function EventLayout({ popup, onClose }: { popup: Popup; onClose: () => void }) {
  const router = useRouter()

  const handleCta = () => {
    onClose()
    if (popup.cta_url) router.push(popup.cta_url)
  }

  return (
    <div
      className="relative w-full overflow-hidden flex flex-col sm:flex-row"
      style={{ maxWidth: 680, maxHeight: '90vh', borderRadius: 4, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', background: '#0f0c29' }}
      onClick={(e) => e.stopPropagation()}
    >
      <CloseButton onClose={onClose} color="#fff" />

      {popup.image_url && (
        <div className="relative sm:w-[44%] h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <Image src={popup.image_url} alt={popup.title} fill sizes="(max-width: 640px) 100vw, 44vw" className="object-cover" style={{ filter: 'brightness(0.85) saturate(1.1)' }} />
          <div className="absolute inset-y-0 right-0 w-16 hidden sm:block" style={{ background: 'linear-gradient(to right, transparent, #0f0c29)' }} />
          <div className="absolute inset-x-0 bottom-0 h-14 sm:hidden" style={{ background: 'linear-gradient(to bottom, transparent, #0f0c29)' }} />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:py-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl" aria-hidden>🎉</span>
          {popup.subtitle && (
            <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: '#818cf8' }}>
              {popup.subtitle}
            </span>
          )}
        </div>
        <div className="w-8 h-px mb-5" style={{ background: '#818cf8', opacity: 0.5 }} />
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4" style={{ color: '#eef2ff', fontFamily: 'Poppins, sans-serif' }}>
          {popup.title}
        </h2>
        {popup.message && (
          <p className="text-sm leading-relaxed mb-6 line-clamp-3" style={{ color: 'rgba(238,242,255,0.55)', maxWidth: 300 }}>
            {popup.message}
          </p>
        )}
        {popup.expires_at && (
          <p className="text-sm font-semibold mb-6" style={{ color: '#a5b4fc' }}>
            📅 Le {new Date(popup.expires_at + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        )}
        {popup.cta_label && (
          <button
            onClick={handleCta}
            className="w-full py-4 text-sm font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-85 active:opacity-70 mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', borderRadius: 2 }}
          >
            {popup.cta_label}
          </button>
        )}
        <button onClick={onClose} className="text-xs text-center transition-opacity hover:opacity-70" style={{ color: 'rgba(238,242,255,0.28)' }}>
          Pas maintenant
        </button>
      </div>
    </div>
  )
}

// ─── Alert layout (red, no image, full-width) ──────────────────────────────────

function AlertLayout({ popup, onClose }: { popup: Popup; onClose: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ maxWidth: 520, borderRadius: 4, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', background: '#1a0505' }}
      onClick={(e) => e.stopPropagation()}
    >
      <CloseButton onClose={onClose} color="rgba(255,240,240,0.6)" />

      <div className="flex flex-col items-center text-center px-8 py-12">
        <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.4)' }}>
          <AlertTriangle size={28} style={{ color: '#ef4444' }} />
        </div>
        <div className="w-8 h-px mb-6" style={{ background: '#ef4444', opacity: 0.4 }} />
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4" style={{ color: '#fff0f0', fontFamily: 'Poppins, sans-serif' }}>
          {popup.title}
        </h2>
        {popup.message && (
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,240,240,0.6)', maxWidth: 340 }}>
            {popup.message}
          </p>
        )}
        <button
          onClick={onClose}
          className="w-full py-4 text-sm font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-85 active:opacity-70"
          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#fff', borderRadius: 2 }}
        >
          {popup.cta_label || 'Compris'}
        </button>
      </div>
    </div>
  )
}

// ─── Shared close button ────────────────────────────────────────────────────────

function CloseButton({ onClose, color }: { onClose: () => void; color: string }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-70"
      aria-label="Fermer"
    >
      <X size={18} color={color} strokeWidth={1.5} />
    </button>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function AnnouncementPopup() {
  const pathname = usePathname()
  const [popup, setPopup] = useState<Popup | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (pathname !== '/') return

    fetch('/api/announcement')
      .then((r) => r.json())
      .then(({ popup: p }: { popup: Popup | null }) => {
        if (!p) return
        if (isDismissed(p)) return
        setPopup(p)
        setShow(true)
      })
      .catch(() => {})
  }, [pathname])

  const handleClose = () => {
    if (popup) markDismissed(popup)
    setShow(false)
  }

  if (pathname !== '/') return null

  return (
    <AnimatePresence>
      {show && popup && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(10, 5, 2, 0.82)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {popup.type === 'chef' && <ChefLayout popup={popup} onClose={handleClose} />}
            {popup.type === 'promo' && <PromoLayout popup={popup} onClose={handleClose} />}
            {popup.type === 'event' && <EventLayout popup={popup} onClose={handleClose} />}
            {popup.type === 'alert' && <AlertLayout popup={popup} onClose={handleClose} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
