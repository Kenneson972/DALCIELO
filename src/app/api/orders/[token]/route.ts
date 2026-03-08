import { NextResponse } from 'next/server'
import { getOrderByToken } from '@/lib/ordersStore'

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
