import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/menu
 * Retourne tous les produits actifs pour CieloBot (lecture publique, pas d'auth).
 * La Pizza du Chef est gérée séparément par /api/announcement.
 */
export async function GET() {
  try {
    const db = getSupabase()
    const { data, error } = await db
      .from('products')
      .select('menu_id, name, price, category, type, available, vegetarian, premium, sauce_au_choix, ingredients, size')
      .eq('is_chef_special', false)
      .order('type')
      .order('menu_id')

    if (error) throw error

    const res = NextResponse.json({ items: data ?? [] })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30')
    return res
  } catch {
    const res = NextResponse.json({ items: [] })
    res.headers.set('Cache-Control', 'no-store')
    return res
  }
}
