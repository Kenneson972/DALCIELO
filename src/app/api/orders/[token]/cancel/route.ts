import { NextResponse } from 'next/server'
import { getOrderByToken, updateOrderStatus } from '@/lib/ordersStore'

/** Statuts pour lesquels le client peut annuler sa commande (sans passer par l'admin). */
const CANCELLABLE_BY_CLIENT: Array<string> = ['pending_validation', 'waiting_payment']

export async function POST(
  _req: Request,
  ctx: { params: { token: string } | Promise<{ token: string }> }
) {
  const params = await Promise.resolve(ctx.params)
  const token = params?.token?.trim()
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const noStoreHeaders = { 'Cache-Control': 'no-store' }

  try {
    const order = await getOrderByToken(token)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: noStoreHeaders })
    }

    if (!CANCELLABLE_BY_CLIENT.includes(order.status)) {
      return NextResponse.json(
        {
          error: 'Cette commande ne peut plus être annulée',
          code: 'NOT_CANCELLABLE',
          currentStatus: order.status,
        },
        { status: 400, headers: noStoreHeaders }
      )
    }

    const updated = await updateOrderStatus(order.id, 'cancelled')
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500, headers: noStoreHeaders }
      )
    }

    return NextResponse.json({ order: updated }, { headers: noStoreHeaders })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[POST /api/orders/:token/cancel] Error:', message, error)
    return NextResponse.json(
      {
        error: 'Failed to cancel order',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500, headers: noStoreHeaders }
    )
  }
}
