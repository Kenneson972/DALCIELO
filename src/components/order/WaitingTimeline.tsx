'use client'

import { CheckCircle } from 'lucide-react'

export function WaitingTimeline() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2">
      {/* Étape 1 : Reçue */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <CheckCircle size={24} strokeWidth={2.5} />
        </div>
        <span className="text-xs mt-2 text-green-600 font-medium">Reçue</span>
      </div>

      <div className="flex-1 w-full sm:w-auto h-1 min-h-[4px] sm:min-w-[24px] bg-gradient-to-r from-green-400 to-amber-400 rounded-full max-w-[60px] sm:max-w-none" />

      {/* Étape 2 : Validation (active) */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <span className="text-xs mt-2 text-amber-600 font-medium">Validation...</span>
      </div>

      <div className="flex-1 w-full sm:w-auto h-1 min-h-[4px] sm:min-w-[24px] bg-gray-200 rounded-full max-w-[60px] sm:max-w-none" />

      {/* Étape 3 : Paiement (à venir) */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">
          💳
        </div>
        <span className="text-xs mt-2 text-gray-400">Paiement</span>
      </div>
    </div>
  )
}
