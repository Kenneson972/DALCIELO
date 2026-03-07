'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/types/order'
import { WaitingTimeline } from './WaitingTimeline'
import { WaitingCarousel } from './WaitingCarousel'
import { FAQAccordion } from './FAQAccordion'
import { OrderSummary } from './OrderSummary'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useQueueEstimate } from '@/hooks/useQueueEstimate'

interface PendingValidationViewProps {
  order: Order
  fetchError?: boolean
  onRetry?: () => void
  onCancel?: () => void
}

export function PendingValidationView({
  order,
  fetchError = false,
  onRetry,
  onCancel,
}: PendingValidationViewProps) {
  const [showOrderMobile, setShowOrderMobile] = useState(false)
  const orderShortId = order.id.slice(0, 8).toUpperCase()
  const { estimate } = useQueueEstimate(true)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-white">
      {/* Badge "En direct" */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/95 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 border border-gray-100">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden />
          <span className="text-xs text-gray-600">En direct</span>
          <span className="text-xs text-gray-400 hidden sm:inline">· Mise à jour auto 10s</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 pt-14">
        {fetchError && onRetry && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <p className="text-amber-800 text-sm font-medium">
              Erreur de chargement. Données affichées peuvent être anciennes.
            </p>
            <Button size="sm" onClick={onRetry}>
              Réessayer
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1 : Hero */}
            <section className="text-center" aria-live="polite">
              {/* Animation pizza (CSS) */}
              <div className="mb-6 flex justify-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
                  <div
                    className="absolute inset-0 rounded-full opacity-20 bg-[#E17B5F] animate-pulse"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center text-7xl sm:text-8xl animate-spin-slow select-none"
                    aria-hidden
                  >
                    🍕
                  </div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Votre commande est entre de bonnes mains 👨‍🍳
              </h1>
              <p className="text-gray-600 mb-4">
                Guylian vérifie la disponibilité et prépare votre commande...
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">
                  ✅ Commande #{orderShortId}
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                  🔒 Paiement sécurisé Stripe
                </span>
              </div>

              <div className="mt-6 max-w-md mx-auto space-y-3">
                <p className="text-sm text-gray-500">
                  ⏱️ Validation sous ~2 minutes
                </p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E17B5F] to-[#D4633F] animate-progress-indeterminate rounded-full"
                    aria-hidden
                  />
                </div>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm text-gray-500 hover:text-red-600 underline transition-colors"
                  >
                    Annuler ma commande
                  </button>
                )}
                {/* Temps d'attente dynamique basé sur la file du four */}
                <div className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${
                  !estimate.ovenAvailable
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : estimate.estimatedMinutes <= 20
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : estimate.estimatedMinutes <= 40
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <span className="text-base">🍕</span>
                  <span>
                    {!estimate.ovenAvailable ? (
                      <strong>Four temporairement indisponible</strong>
                    ) : (
                      <>
                        Préparation estimée : <strong>~{estimate.estimatedMinutes} min</strong>
                      </>
                    )}
                    {estimate.ovenAvailable && estimate.totalItems > 0 && (
                      <span className="ml-1 opacity-70 text-xs">
                        ({estimate.totalItems} pizza{estimate.totalItems > 1 ? 's' : ''} avant vous)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* Section 2 : Timeline */}
            <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <WaitingTimeline />
            </section>

            {/* Section 3 : Carousel */}
            <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <WaitingCarousel />
            </section>

            {/* Section 4 : FAQ */}
            <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Questions fréquentes
              </h2>
              <FAQAccordion />
            </section>
          </div>

          {/* Sidebar (1/3) - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Votre commande
              </h2>
              <OrderSummary order={order} />
            </div>
          </aside>
        </div>

        {/* Mobile : récap collapsible en bas */}
        <div className="lg:hidden mt-8">
          <button
            type="button"
            onClick={() => setShowOrderMobile(!showOrderMobile)}
            className="w-full flex items-center justify-between bg-white rounded-2xl shadow-lg p-4 font-semibold text-gray-900"
          >
            Voir ma commande
            {showOrderMobile ? (
              <ChevronUp size={20} className="text-[#E17B5F]" />
            ) : (
              <ChevronDown size={20} className="text-[#E17B5F]" />
            )}
          </button>
          {showOrderMobile && (
            <div className="mt-2 bg-white rounded-2xl shadow-lg p-6">
              <OrderSummary order={order} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
