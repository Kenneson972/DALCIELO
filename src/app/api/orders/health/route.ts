import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabaseAdmin'

/**
 * GET /api/orders/health
 * Vérifie que Supabase est configuré et que la table orders existe.
 */
export async function GET() {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('orders').select('id').limit(1)
    if (error) throw error
    return NextResponse.json({ ok: true, message: 'Base de données prête pour les commandes' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[GET /api/orders/health]', message)
    return NextResponse.json(
      { ok: false, error: 'Database unavailable' },
      { status: 503 }
    )
  }
}
