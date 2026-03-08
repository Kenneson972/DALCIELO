'use client'

import { useState } from 'react'
import { MessageCircle, Phone, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink, X } from 'lucide-react'
import type { Order } from '@/types/order'

function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
}

const REFUSAL_REASONS = [
  'Stock insuffisant',
  'Fermeture exceptionnelle',
  'Zone de livraison hors périmètre',
  'Heure de commande trop tardive',
  'Produit indisponible ce soir',
  'Autre',
]

interface QuickActionsProps {
  order: Order
  onStatusChange: (newStatus: string, data?: any) => void
}

export function QuickActions({ order, onStatusChange }: QuickActionsProps) {
  const [showCustomMessage, setShowCustomMessage] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [showDelayModal, setShowDelayModal] = useState(false)
  const [delayTime, setDelayTime] = useState('')
  const [validating, setValidating] = useState(false)
  const [validateError, setValidateError] = useState<string | null>(null)
  const [showRefuseModal, setShowRefuseModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const sendWhatsApp = (message: string) => {
    const cleanPhone = order.client_phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleStartPreparation = () => {
    const estimatedDate = new Date(Date.now() + 20 * 60000)
    onStatusChange('in_preparation', {
      estimated_ready_time: estimatedDate.toISOString(),
      preparation_started_at: new Date().toISOString(),
    })
  }

  const handleMarkReady = () => {
    onStatusChange('ready', {
      actual_ready_time: new Date().toISOString(),
    })
  }

  const handleComplete = () => {
    onStatusChange('completed', {
      completed_at: new Date().toISOString(),
    })
  }

  const handleDelay = () => {
    if (!delayTime) return

    onStatusChange(order.status, {
      estimated_ready_time: delayTime,
      notes: `${order.notes || ''}\nRetard signalé : ${delayTime}`.trim(),
    })

    setShowDelayModal(false)
    setDelayTime('')
  }

  const handleRefuseConfirm = () => {
    const reason = selectedReason === 'Autre' ? customReason.trim() : selectedReason
    if (!reason) return

    onStatusChange('refused', { refusal_reason: reason })
    setShowRefuseModal(false)
    setSelectedReason('')
    setCustomReason('')
  }

  const handleCustomMessage = () => {
    if (!customMessage.trim()) return
    sendWhatsApp(`Bonjour ${order.client_name},\n\n${customMessage}\n\n- Pizza dal Cielo 🍕`)
    setCustomMessage('')
    setShowCustomMessage(false)
  }

  const handleValidate = async () => {
    setValidateError(null)
    setValidating(true)
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(`${base}/api/admin/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': getAdminPin(),
        },
        body: JSON.stringify({ order }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error || `Erreur ${res.status}`
        setValidateError(msg + (msg.includes('STRIPE') ? ' — Vérifiez STRIPE_SECRET_KEY sur Vercel' : ''))
        return
      }
      const paymentLinkUrl = data.paymentLink
      onStatusChange('waiting_payment', paymentLinkUrl ? { payment_link: paymentLinkUrl } : undefined)
    } catch (e) {
      setValidateError('Erreur réseau — vérifiez la console (F12)')
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-slate-700 text-sm">Actions rapides :</h4>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={`tel:${order.client_phone}`}
          className="flex items-center justify-center gap-2 min-h-[44px] bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation"
        >
          <Phone size={18} />
          Appeler
        </a>

        <button
          onClick={() => setShowCustomMessage((prev) => !prev)}
          className="flex items-center justify-center gap-2 min-h-[44px] bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation"
        >
          <MessageCircle size={18} />
          Message
        </button>
      </div>

      {showCustomMessage && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Ecrivez votre message..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none focus:outline-none focus:border-green-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCustomMessage}
              disabled={!customMessage.trim()}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Envoyer par WhatsApp
            </button>
            <button
              onClick={() => setShowCustomMessage(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {order.status === 'pending_validation' && (
        <div className="space-y-2">
          {validateError && (
            <p className="text-sm text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg font-medium">
              {validateError}
            </p>
          )}
          <button
            onClick={handleValidate}
            disabled={validating}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-green-500 hover:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation"
          >
            {validating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {validating ? 'Création du lien de paiement...' : 'Valider la commande'}
          </button>
          <button
            onClick={() => setShowRefuseModal(true)}
            disabled={validating}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 touch-manipulation"
          >
            <XCircle size={18} />
            Refuser
          </button>
        </div>
      )}

      {order.status === 'waiting_payment' && (
        <div className="space-y-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <CheckCircle size={15} className="text-green-600 shrink-0" />
              Lien de paiement actif sur la page client
            </p>
            <p className="text-xs text-green-600 mt-0.5 ml-5">
              Le client voit &quot;Payer maintenant&quot; sur sa page de suivi.
            </p>
          </div>
          {order.payment_link && (
            <a
              href={order.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <ExternalLink size={14} />
              Voir le lien Stripe
            </a>
          )}
        </div>
      )}

      {order.status === 'paid' && (
        <button
          onClick={handleStartPreparation}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
        >
          <Clock size={18} />
          Commencer la preparation
        </button>
      )}

      {order.status === 'in_preparation' && (
        <div className="space-y-2">
          <button
            onClick={handleMarkReady}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
          >
            <CheckCircle size={18} />
            Marquer comme prete
          </button>
          <button
            onClick={() => setShowDelayModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
          >
            <AlertCircle size={18} />
            Signaler un retard
          </button>
        </div>
      )}

      {order.status === 'ready' && (
        <button
          onClick={handleComplete}
          className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl font-medium transition-colors"
        >
          <CheckCircle size={18} />
          Marquer comme recuperee
        </button>
      )}

      {/* Modal : Signaler un retard */}
      {showDelayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Signaler un retard</h3>
            <p className="text-slate-600 mb-4">Nouvelle heure estimee :</p>
            <input
              type="time"
              value={delayTime}
              onChange={(e) => setDelayTime(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-lg focus:outline-none focus:border-orange-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelay}
                disabled={!delayTime}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-300 text-white px-4 py-3 rounded-xl font-bold transition-colors"
              >
                Envoyer au client par WhatsApp
              </button>
              <button
                onClick={() => setShowDelayModal(false)}
                className="px-4 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal : Raison du refus */}
      {showRefuseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900">Raison du refus</h3>
              <button
                onClick={() => {
                  setShowRefuseModal(false)
                  setSelectedReason('')
                  setCustomReason('')
                }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors touch-manipulation"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {REFUSAL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all text-sm ${
                    selectedReason === reason
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
              {selectedReason === 'Autre' && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Précisez la raison..."
                  autoFocus
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-red-500 text-sm"
                />
              )}
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Le client verra cette raison sur sa page de suivi de commande.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleRefuseConfirm}
                disabled={!selectedReason || (selectedReason === 'Autre' && !customReason.trim())}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-bold transition-colors"
              >
                Confirmer le refus
              </button>
              <button
                onClick={() => {
                  setShowRefuseModal(false)
                  setSelectedReason('')
                  setCustomReason('')
                }}
                className="px-4 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
