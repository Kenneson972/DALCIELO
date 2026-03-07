import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'

/**
 * GET /api/admin/me
 * Vérifie que le PIN admin est valide (rate limit + pas de PIN en clair côté client).
 */
export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError
  return NextResponse.json({ ok: true })
}
