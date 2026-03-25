'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  const refuse = () => {
    localStorage.setItem('cookie_consent', 'refused')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      className="fixed bottom-0 left-0 right-0 z-[9998] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-2xl rounded-2xl bg-slate-900 p-5 shadow-2xl text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-slate-200">
          <p className="font-semibold text-white mb-1">Ce site utilise des cookies</p>
          <p>Des cookies essentiels sont utilisés pour assurer le bon fonctionnement du site.{' '}
            <a href="/mentions" className="underline text-coral hover:text-coral/80">En savoir plus</a>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={refuse}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[40px]"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-coral text-white hover:bg-burnt-orange transition-colors min-h-[40px]"
          >
            Accepter
          </button>
          <button
            onClick={refuse}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
