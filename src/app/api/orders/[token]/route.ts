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

  // #region agent log
  const _log = (msg: string, data?: Record<string, unknown>) => {
    const payload = { sessionId: 'f613ab', location: 'api/orders/[token]/route.ts', message: msg, data: data ?? {}, timestamp: Date.now(), hypothesisId: 'H2' }
    console.error('[DEBUG f613ab]', JSON.stringify(payload))
    fetch('http://127.0.0.1:7849/ingest/2842ecba-697b-4ffb-96d4-5f23dffb6cbb', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f613ab' }, body: JSON.stringify(payload) }).catch(() => {})
  }
  // #endregion

  try {
    const order = await getOrderByToken(token)
    if (!order) {
      _log('getOrderByToken not found', { token })
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: noStoreHeaders })
    }
    _log('getOrderByToken found', { status: order.status, hasPaymentLink: !!order.payment_link })
    return NextResponse.json({ order }, { headers: noStoreHeaders })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    try { _log('getOrderByToken error', { message }) } catch {}
    console.error('[GET /api/orders/:token] Error:', message, error)
    return NextResponse.json(
      { error: 'Failed to fetch order', details: process.env.NODE_ENV === 'development' ? message : undefined },
      { status: 500, headers: noStoreHeaders }
    )
  }
}
