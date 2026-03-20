import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getApprovedReviews, getReviewStats, createReview } from '@/lib/reviewsStore'

export const dynamic = 'force-dynamic'

// Rate-limit en mémoire : ip_hash → timestamp du dernier avis
const recentSubmissions = new Map<string, number>()
const RATE_LIMIT_MS = 60 * 60 * 1000 // 1 h

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_HASH_SALT ?? 'dalcielo')).digest('hex')
}

/**
 * GET /api/reviews?menuId=201
 * Retourne les avis approuvés + les stats pour un produit.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const menuId = parseInt(searchParams.get('menuId') ?? '', 10)
  if (!menuId || isNaN(menuId)) {
    return NextResponse.json({ error: 'menuId requis' }, { status: 400 })
  }
  try {
    const [reviews, stats] = await Promise.all([
      getApprovedReviews(menuId),
      getReviewStats(menuId),
    ])
    return NextResponse.json({ reviews, stats }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/reviews]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/reviews
 * Soumet un nouvel avis (en attente de modération).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Honeypot : champ caché, doit être vide
    if (body.website) {
      return NextResponse.json({ ok: true }) // silencieux
    }

    const { menu_id, author_name, rating, comment } = body

    // Validations basiques
    if (!menu_id || typeof menu_id !== 'number') {
      return NextResponse.json({ error: 'menu_id invalide' }, { status: 400 })
    }
    if (!author_name || typeof author_name !== 'string' || !author_name.trim()) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 })
    }
    if (comment && typeof comment === 'string' && comment.length > 1000) {
      return NextResponse.json({ error: 'Commentaire trop long (max 1000 caractères)' }, { status: 400 })
    }

    // Rate limit par IP
    const forwarded = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
    const ip = forwarded.split(',')[0].trim()
    const ipHash = hashIp(ip)
    const lastTime = recentSubmissions.get(ipHash)
    if (lastTime && Date.now() - lastTime < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Vous avez déjà soumis un avis récemment. Réessayez dans 1h.' },
        { status: 429 }
      )
    }

    await createReview({
      menu_id,
      author_name: author_name.trim(),
      rating,
      comment: typeof comment === 'string' ? comment.trim() : undefined,
      ip_hash: ipHash,
    })

    recentSubmissions.set(ipHash, Date.now())

    return NextResponse.json(
      { ok: true, message: 'Avis soumis ! Il sera visible après modération.' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/reviews]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
