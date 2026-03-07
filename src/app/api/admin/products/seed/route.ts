import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { seedProducts } from '@/lib/productsStore'

export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const result = await seedProducts()
    return NextResponse.json({
      success: true,
      message: `Catalogue synchronisé : ${result.inserted} produits`,
      ...result,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[POST /api/admin/products/seed]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
