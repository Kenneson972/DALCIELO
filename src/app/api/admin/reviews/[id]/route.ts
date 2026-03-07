import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { moderateReview } from '@/lib/reviewsStore'

interface RouteContext {
  params: { id: string }
}

/**
 * PATCH /api/admin/reviews/:id
 * Modère un avis : { status: 'approved' | 'rejected' }
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const { status } = await req.json()
    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'status doit être "approved" ou "rejected"' }, { status: 400 })
    }
    const review = await moderateReview(params.id, status)
    if (!review) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })
    return NextResponse.json({ review })
  } catch (err) {
    console.error('[PATCH /api/admin/reviews/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
