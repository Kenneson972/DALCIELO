import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getAllReviews } from '@/lib/reviewsStore'
import type { ReviewStatus } from '@/types/review'

/**
 * GET /api/admin/reviews?status=pending
 * Liste tous les avis (admin).
 */
export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')
  const status = (['pending', 'approved', 'rejected'] as ReviewStatus[]).includes(statusParam as ReviewStatus)
    ? (statusParam as ReviewStatus)
    : undefined

  try {
    const reviews = await getAllReviews(status)
    return NextResponse.json({ reviews })
  } catch (err) {
    console.error('[GET /api/admin/reviews]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
