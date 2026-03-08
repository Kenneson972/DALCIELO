import { NextResponse } from 'next/server'
import { getOrderByToken } from '@/lib/ordersStore'

export async function GET(
  _req: Request,
  ctx: { params: { token: string } | Promise<{ token: string }> }
) {
  // #region agent log
  const debugLog = (hypothesisId: string, message: string, data: Record<string, unknown> = {}) => {
    fetch('http://127.0.0.1:7849/ingest/2842ecba-697b-4ffb-96d4-5f23dffb6cbb',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f613ab'},body:JSON.stringify({sessionId:'f613ab',runId:'api-orders-token',hypothesisId,location:'api/orders/[token]/route.ts',message,data,timestamp:Date.now()})}).catch(()=>{});
  }
  // #endregion
  const params = await Promise.resolve(ctx.params)
  const token = params?.token?.trim()
  debugLog('H_API', 'api route entered', { tokenPresent: Boolean(token) })
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const noStoreHeaders = {
    'Cache-Control': 'no-store',
  }

  try {
    const order = await getOrderByToken(token)
    if (!order) {
      debugLog('H_API', 'order not found', { token })
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: noStoreHeaders })
    }
    debugLog('H_API', 'order found', {
      token,
      status: order.status,
      hasPaymentLink: Boolean(order.payment_link),
    })
    return NextResponse.json({ order }, { headers: noStoreHeaders })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    debugLog('H_API', 'order fetch error', { token, message })
    console.error('[GET /api/orders/:token] Error:', message, error)
    return NextResponse.json(
      { error: 'Failed to fetch order', details: process.env.NODE_ENV === 'development' ? message : undefined },
      { status: 500, headers: noStoreHeaders }
    )
  }
}
