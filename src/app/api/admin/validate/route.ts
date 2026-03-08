import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getOrderById, updateOrderStatus } from '@/lib/ordersStore'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  // #region agent log
  const _log = (msg: string, data?: Record<string, unknown>) => {
    const payload = { sessionId: 'f613ab', location: 'validate/route.ts', message: msg, data: data ?? {}, timestamp: Date.now(), hypothesisId: 'H1' }
    console.error('[DEBUG f613ab]', JSON.stringify(payload))
    fetch('http://127.0.0.1:7849/ingest/2842ecba-697b-4ffb-96d4-5f23dffb6cbb', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f613ab' }, body: JSON.stringify(payload) }).catch(() => {})
  }
  // #endregion

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      _log('STRIPE_SECRET_KEY missing', {})
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not defined' },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const orderId = typeof body?.order?.id === 'string' ? body.order.id.trim() : null
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order payload: order.id required' }, { status: 400 })
    }

    _log('validate start', { orderId })
    const orderFromDb = await getOrderById(orderId)
    if (!orderFromDb) {
      _log('Order not found in Supabase', { orderId })
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (orderFromDb.status !== 'pending_validation' && orderFromDb.status !== 'waiting_payment') {
      return NextResponse.json(
        { error: 'Order cannot be validated in current status' },
        { status: 400 }
      )
    }

    const total = Number(orderFromDb.total)
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 })
    }

    const items = orderFromDb.items ?? []
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order has no items' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    })

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(Number(item.price) * 100),
        product_data: {
          name: String(item.name ?? 'Article'),
        },
      },
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    }))

    // Ajouter les frais de livraison comme ligne séparée si applicable
    if (orderFromDb.type_service === 'delivery') {
      const itemsSum = Math.round(items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0) * 100) / 100
      const deliveryFee = Math.round((total - itemsSum) * 100) / 100
      if (deliveryFee > 0) {
        line_items.push({
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(deliveryFee * 100),
            product_data: { name: 'Frais de livraison' },
          },
          quantity: 1,
        })
      }
    }

    const origin =
      req.headers.get('origin') ??
      req.nextUrl?.origin ??
      (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      metadata: { orderId: orderFromDb.id },
      success_url: `${origin}/order/${orderFromDb.token}?paid=1`,
      cancel_url: `${origin}/order/${orderFromDb.token}`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    _log('Updating order with payment_link', { orderId: orderFromDb.id, hasUrl: !!session.url })
    await updateOrderStatus(orderFromDb.id, 'waiting_payment', {
      payment_link: session.url,
    })

    _log('validate success', { orderId: orderFromDb.id })
    return NextResponse.json({ paymentLink: session.url })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    try { _log('validate error', { message }) } catch {}
    console.error('Validate error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
