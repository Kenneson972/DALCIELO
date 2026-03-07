'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { contactInfo } from '@/data/menuData'
import type { Order } from '@/types/order'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_LABELS: Record<string, string> = {
  completed:       'Terminée',
  paid:            'Payée',
  in_preparation:  'En préparation',
  ready:           'Prête',
  waiting_payment: 'En attente de paiement',
}

export default function ReceiptPage() {
  const params = useParams()
  const token = useMemo(() => {
    const v = params?.token
    return Array.isArray(v) ? v[0] : v
  }, [params]) as string | undefined

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch(`/api/orders/${encodeURIComponent(token)}`, {
      cache: 'no-store',
      headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (!cancelled && data?.order) setOrder(data.order)
        else if (!cancelled) setError(true)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  if (loading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-400 text-sm">Chargement du reçu…</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <p className="text-gray-800 font-semibold mb-2">Reçu introuvable</p>
          <p className="text-gray-500 text-sm mb-6">Ce lien n'est pas valide ou la commande a expiré.</p>
          <Button onClick={() => (window.location.href = '/')}>Retour à l'accueil</Button>
        </div>
      </div>
    )
  }

  const serviceLabel = order.type_service === 'click_collect' ? 'Click & Collect' : 'Livraison'
  const fullAddress = `${contactInfo.address.street}, ${contactInfo.address.postalCode} ${contactInfo.address.city}`

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-8 px-4 print:p-0 print:py-0">

      {/* ── Barre d'actions (écran uniquement) ── */}
      <div className="print:hidden max-w-[640px] mx-auto mb-5">
        <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex flex-wrap gap-3 justify-center items-center">
          {order.receipt_pdf_url && (
            <a
              href={order.receipt_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              📄 Télécharger le PDF
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            🖨️ Imprimer
          </button>
          <button
            onClick={() => (window.location.href = `/order/${token}`)}
            className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            ← Suivi
          </button>
        </div>
        {!order.receipt_pdf_url && (
          <p className="text-center text-[11px] text-gray-400 mt-2">
            « Imprimer » → « Enregistrer au format PDF » pour télécharger.
          </p>
        )}
      </div>

      {/* ── Document reçu ── */}
      <div className="max-w-[640px] mx-auto bg-white shadow-lg print:shadow-none print:max-w-none">

        {/* En-tête */}
        <div className="text-center px-10 pt-10 pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Pizza dal Cielo"
            width={80}
            height={80}
            className="w-20 h-20 object-contain mx-auto mb-3"
          />
          <h1 className="text-[22px] font-black text-gray-900 tracking-tight">Pizza dal Cielo</h1>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
            {fullAddress}<br />
            {contactInfo.phone} · {contactInfo.email}
          </p>
        </div>

        {/* Séparateur orange */}
        <div className="h-[3px] bg-orange-500 mx-10" />

        {/* Titre REÇU CLIENT */}
        <div className="mx-10 mt-5 mb-5 bg-gray-50 border border-gray-100 rounded-lg py-3 text-center">
          <span className="text-[13px] font-black tracking-[3px] text-gray-800 uppercase">Reçu Client</span>
        </div>

        {/* Grille infos */}
        <div className="mx-10 mb-6 grid grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500 mb-3">Détails commande</p>
            <div className="space-y-1.5 text-[11px]">
              {[
                ['N° Cde',  `#${order.id.slice(0, 8).toUpperCase()}`],
                ['Date',    formatDate(order.created_at)],
                ['Heure',   order.heure_souhaitee || '—'],
                ['Service', serviceLabel],
                ['Statut',  STATUS_LABELS[order.status] ?? order.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-gray-400 shrink-0">{label}</span>
                  <span className="font-semibold text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500 mb-3">Client</p>
            <div className="space-y-1.5 text-[11px]">
              {[
                ['Nom',     order.client_name],
                ['Tél',     order.client_phone],
                ['Adresse', order.type_service === 'delivery' && order.delivery_address ? order.delivery_address : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-gray-400 shrink-0">{label}</span>
                  <span className="font-semibold text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau articles */}
        <div className="mx-10 mb-6">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b-2 border-orange-500">
                <th className="text-left pb-2.5 font-semibold uppercase tracking-wide text-gray-400 text-[9px]">Article</th>
                <th className="text-center pb-2.5 font-semibold uppercase tracking-wide text-gray-400 text-[9px]">Qté</th>
                <th className="text-right pb-2.5 font-semibold uppercase tracking-wide text-gray-400 text-[9px]">P.U.</th>
                <th className="text-right pb-2.5 font-semibold uppercase tracking-wide text-gray-400 text-[9px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={`${order.id}-${item.id}-${i}`} className="border-b border-gray-100">
                  <td className="py-2.5 text-gray-800 font-medium">
                    {item.name}
                    {item.customizations && item.customizations.length > 0 && (
                      <span className="block text-[10px] text-gray-400 font-normal mt-0.5">
                        {item.customizations.join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-center text-gray-500">{item.quantity}</td>
                  <td className="py-2.5 text-right text-gray-500">
                    {item.price.toFixed(2).replace('.', ',')} €
                  </td>
                  <td className="py-2.5 text-right font-bold text-gray-800">
                    {(item.price * item.quantity).toFixed(2).replace('.', ',')} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mx-10 mb-6 flex justify-end">
          <div className="border-2 border-orange-500 rounded-xl px-8 py-3 text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500">Payé</p>
            <p className="text-[26px] font-black text-gray-900 leading-tight">
              {order.total.toFixed(2).replace('.', ',')} €
            </p>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mx-10 mb-6 border-l-4 border-orange-400 bg-orange-50 px-4 py-3 rounded-r-xl">
            <p className="text-[10px] font-bold uppercase tracking-wide text-orange-600 mb-1">Notes</p>
            <p className="text-[11px] text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mx-10 pb-10 pt-5 border-t border-dashed border-gray-200 text-center">
          <p className="text-[11px] text-gray-400">Merci pour votre confiance. À bientôt chez Pizza dal Cielo !</p>
          <p className="text-[10px] text-gray-300 mt-1">
            Reçu généré le {formatDate(new Date().toISOString())}
          </p>
        </div>

      </div>
    </div>
  )
}
