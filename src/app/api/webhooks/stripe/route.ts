import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateOrderStatus } from '@/lib/ordersStore'

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe env missing' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16' as any,
  })

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    let orderId = session.metadata?.orderId

    if (!orderId && session.payment_link) {
      const linkId = typeof session.payment_link === 'string' ? session.payment_link : (session.payment_link as { id?: string })?.id
      if (linkId) {
        const paymentLink = await stripe.paymentLinks.retrieve(linkId)
        orderId = paymentLink.metadata?.orderId
      }
    }

    if (orderId) {
      try {
        const updated = await updateOrderStatus(orderId, 'paid')
        if (updated && process.env.N8N_RECEIPT_WEBHOOK_URL) {
          fetch(process.env.N8N_RECEIPT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: updated.token }),
            signal: AbortSignal.timeout(10000),
          }).catch(() => {})
        }
      } catch (e) {
        console.error('[Webhook Stripe] updateOrderStatus failed:', e)
      }
    }
  }

  return NextResponse.json({ received: true })
}
