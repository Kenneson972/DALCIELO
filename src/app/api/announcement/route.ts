import { NextResponse } from 'next/server'
import { getActivePopup } from '@/lib/popupsStore'
import { getChefProduct } from '@/lib/productsStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [popup, product] = await Promise.all([
      getActivePopup(),
      getChefProduct(),
    ])
    const res = NextResponse.json({ popup, product })
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
  } catch {
    const res = NextResponse.json({ popup: null, product: null })
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
  }
}
