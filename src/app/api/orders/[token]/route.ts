import { NextResponse } from 'next/server'
import { getOrderByToken } from '@/lib/ordersStore'

// IMPORTANT: éviter tout cache stale sur le suivi commande client
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _req: Request,
  ctx: { params: { token: string } | Promise<{ token: string }> }
) {
  const params = await Promise.resolve(ctx.params)
  const token = params?.token?.trim()
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const noStoreHeaders = {
    'Cache-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
  }

  try {
    const order = await getOrderByToken(token)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: noStoreHeaders })
    }
    return NextResponse.json({ order }, { headers: noStoreHeaders })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[GET /api/orders/:token] Error:', message, error)
    return NextResponse.json(
      { error: 'Failed to fetch order', details: process.env.NODE_ENV === 'development' ? message : undefined },
      { status: 500, headers: noStoreHeaders }
    )
  }
}
