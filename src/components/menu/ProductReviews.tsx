'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star } from 'lucide-react'
import type { Review, ReviewStats } from '@/types/review'

interface ProductReviewsProps {
  menuId: number
  productName: string
}

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 20,
}: {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: number
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readOnly ? 'button' : 'button'}
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
          aria-label={readOnly ? undefined : `${star} étoile${star > 1 ? 's' : ''}`}
          style={{ minWidth: size, minHeight: size }}
        >
          <Star
            size={size}
            className={
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200'
            }
          />
        </button>
      ))}
    </div>
  )
}

function StatsBar({ stats }: { stats: ReviewStats }) {
  if (stats.total === 0) return null
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
      {/* Note globale */}
      <div className="flex flex-col items-center bg-[#fdf6f0] rounded-2xl px-6 py-4 border border-[#ead5c4] shrink-0">
        <span className="font-playfair text-4xl font-black text-primary leading-none">
          {stats.average.toFixed(1)}
        </span>
        <StarRating value={Math.round(stats.average)} readOnly size={16} />
        <span className="text-xs text-[#7a5540] mt-1">{stats.total} avis</span>
      </div>

      {/* Distribution */}
      <div className="flex-1 w-full space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = stats.distribution[star] ?? 0
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-2 text-xs text-[#7a5540]">
              <span className="w-4 text-right shrink-0">{star}</span>
              <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-5 text-right shrink-0">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return (
    <div className="bg-white/70 rounded-2xl border border-[#ead5c4]/60 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-[#2d1a0e] text-sm leading-tight">{review.author_name}</p>
          <p className="text-[0.7rem] text-[#b07050]">{date}</p>
        </div>
        <StarRating value={review.rating} readOnly size={14} />
      </div>
      {review.comment && (
        <p className="text-sm text-[#7a5540] leading-relaxed">{review.comment}</p>
      )}
    </div>
  )
}

function ReviewForm({
  menuId,
  onSuccess,
}: {
  menuId: number
  onSuccess: () => void
}) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (rating === 0) { setError('Veuillez choisir une note.'); return }
    if (!name.trim()) { setError('Veuillez entrer votre prénom.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: menuId,
          author_name: name.trim(),
          rating,
          comment: comment.trim() || undefined,
          website: honeypot, // honeypot field
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la soumission.')
      } else {
        setSuccess(true)
        onSuccess()
      }
    } catch {
      setError('Connexion impossible. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6 px-4 bg-green-50 rounded-2xl border border-green-200">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-bold text-green-800">Merci pour votre avis !</p>
        <p className="text-sm text-green-700 mt-1">Il sera visible après validation par notre équipe.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot (masqué) */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
      />

      {/* Note */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#7a5540] mb-2">
          Votre note *
        </label>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>

      {/* Prénom */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#7a5540] mb-1.5">
          Votre prénom *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jean-Pierre"
          maxLength={80}
          className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-[#ead5c4] bg-white/80 text-[#2d1a0e] placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all"
          required
        />
      </div>

      {/* Commentaire */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#7a5540] mb-1.5">
          Votre avis <span className="font-normal normal-case tracking-normal">(facultatif)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Dites-nous ce que vous en avez pensé…"
          maxLength={1000}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-[#ead5c4] bg-white/80 text-[#2d1a0e] placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all resize-none"
        />
        <p className="text-right text-[0.68rem] text-slate-400 mt-0.5">{comment.length}/1000</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 border border-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[48px] bg-gradient-to-br from-primary to-secondary text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Envoi…' : 'Publier mon avis'}
      </button>
    </form>
  )
}

export function ProductReviews({ menuId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?menuId=${menuId}`)
      if (!res.ok) return
      const data = await res.json()
      setReviews(data.reviews ?? [])
      setStats(data.stats ?? { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }, [menuId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/75 px-4 sm:px-6 md:px-10 py-6 md:py-8 mt-4"
      style={{
        background: 'rgba(255,252,248,0.7)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset, 0 16px 40px -10px rgba(160,80,30,0.18)',
      }}
    >
      {/* En-tête */}
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-playfair text-lg font-bold text-[#2d1a0e]">
          Avis clients{stats.total > 0 ? ` (${stats.total})` : ''}
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs font-bold text-primary hover:text-secondary transition-colors min-h-[44px] flex items-center px-1"
        >
          {showForm ? 'Annuler' : '✏️ Laisser un avis'}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="mb-6 pb-6 border-b border-[#ead5c4]/60">
          <ReviewForm
            menuId={menuId}
            onSuccess={() => {
              setShowForm(false)
              fetchReviews()
            }}
          />
        </div>
      )}

      {/* Stats */}
      {!loading && stats.total > 0 && <StatsBar stats={stats} />}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-sm font-medium text-[#7a5540]">
            Soyez le premier à laisser un avis sur {productName} !
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-bold text-primary hover:text-secondary transition-colors min-h-[44px] px-4"
            >
              Écrire un avis →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  )
}
