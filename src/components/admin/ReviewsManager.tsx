'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Check, X, RefreshCw, Filter } from 'lucide-react'
import type { Review, ReviewStatus } from '@/types/review'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
        />
      ))}
    </div>
  )
}

const STATUS_LABELS: Record<ReviewStatus, { label: string; color: string }> = {
  pending:  { label: 'En attente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved: { label: 'Approuvé',   color: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Rejeté',     color: 'bg-red-100 text-red-700 border-red-200' },
}

function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
}

export function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<ReviewStatus | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = filter === 'all' ? '/api/admin/reviews' : `/api/admin/reviews?status=${filter}`
      const res = await fetch(url, {
        headers: { 'x-admin-pin': getAdminPin() },
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur serveur'); return }
      setReviews(data.reviews ?? [])
    } catch {
      setError('Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': getAdminPin(),
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        )
      } else {
        const d = await res.json()
        setError(d.error ?? 'Erreur lors de la modération.')
      }
    } catch {
      setError('Connexion impossible.')
    } finally {
      setActionLoading(null)
    }
  }

  const counts = {
    pending:  reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  }

  const displayed = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter)

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { value: 'pending',  label: `En attente (${counts.pending})` },
          { value: 'approved', label: `Approuvés (${counts.approved})` },
          { value: 'rejected', label: `Rejetés (${counts.rejected})` },
          { value: 'all',      label: 'Tous' },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 min-h-[40px] rounded-xl text-sm font-medium border transition-all touch-manipulation ${
              filter === value
                ? 'bg-coral text-white border-coral shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}

        <button
          onClick={fetchReviews}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl text-sm text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation"
          title="Actualiser"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200">
          {error}
        </p>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-slate-500 font-medium">Aucun avis dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((review) => {
            const { label, color } = STATUS_LABELS[review.status]
            const date = new Date(review.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-3 justify-between mb-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{review.author_name}</span>
                      <StarDisplay rating={review.rating} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">{date}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">Produit #{review.menu_id}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${color} shrink-0`}>
                    {label}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{review.comment}</p>
                )}

                {review.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => moderate(review.id, 'approved')}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 touch-manipulation"
                    >
                      <Check size={14} />
                      Approuver
                    </button>
                    <button
                      onClick={() => moderate(review.id, 'rejected')}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-red-100 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-200 active:scale-95 transition-all disabled:opacity-50 touch-manipulation"
                    >
                      <X size={14} />
                      Rejeter
                    </button>
                  </div>
                )}

                {review.status !== 'pending' && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    {review.status === 'approved' ? (
                      <button
                        onClick={() => moderate(review.id, 'rejected')}
                        disabled={actionLoading === review.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-medium hover:bg-red-100 transition-all disabled:opacity-50 touch-manipulation"
                      >
                        <X size={13} />
                        Rejeter
                      </button>
                    ) : (
                      <button
                        onClick={() => moderate(review.id, 'approved')}
                        disabled={actionLoading === review.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-medium hover:bg-green-100 transition-all disabled:opacity-50 touch-manipulation"
                      >
                        <Check size={13} />
                        Approuver
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
