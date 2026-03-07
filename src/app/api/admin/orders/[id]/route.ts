import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/ordersStore'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import type { Order, OrderStatus } from '@/types/order'

const ORDER_STATUSES = [
  'pending_validation', 'waiting_payment', 'paid', 'in_preparation',
  'ready', 'in_delivery', 'completed', 'cancelled', 'refused',
] as const

const PatchSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  preparation_started_at: z.string().optional(),
  actual_ready_time: z.string().optional(),
  completed_at: z.string().optional(),
  refusal_reason: z.string().optional(),
  payment_link: z.string().optional(),
  notes: z.string().optional(),
  delivery_address: z.string().optional(),
  estimated_ready_time: z.string().optional(),
  receipt_category: z.string().max(64).nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const { id } = await Promise.resolve(params)
  if (!id) {
    return NextResponse.json({ error: 'Order id required' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { status, ...rest } = parsed.data
    const sanitized = Object.fromEntries(
      Object.entries(rest).map(([k, v]) => [k, v === null ? undefined : v])
    ) as Partial<Order>
    const updated = await updateOrderStatus(id, status as OrderStatus, sanitized)

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Notifier le bot n8n quand une commande est validée (waiting_payment)
    // Fire-and-forget : on ne bloque pas la réponse sur cette requête
    if (status === 'waiting_payment' && process.env.N8N_ORDER_NOTIFY_WEBHOOK_URL) {
      const trackingUrl = `${process.env.APP_URL || 'https://dalcielo.fr'}/order/${updated.token}`
      fetch(process.env.N8N_ORDER_NOTIFY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order_validated',
          client_name: updated.client_name,
          client_phone: updated.client_phone,
          token: updated.token,
          payment_link: updated.payment_link,
          heure_souhaitee: updated.heure_souhaitee,
          tracking_url: trackingUrl,
        }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {}) // Échec silencieux — ne bloque pas la validation
    }

    return NextResponse.json({ success: true, order: updated })
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; details?: string }
    const message =
      err?.message ||
      (typeof err?.details === 'string' ? err.details : null) ||
      (error instanceof Error ? error.message : String(error))
    console.error('[PATCH /api/admin/orders/:id] Error:', message, error)
    const isSupabaseUnconfigured = String(message).toLowerCase().includes('supabase non configuré')
    const status = isSupabaseUnconfigured ? 503 : 500
    return NextResponse.json(
      {
        error: isSupabaseUnconfigured ? 'Supabase non configuré' : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? message : isSupabaseUnconfigured ? message : undefined,
      },
      { status }
    )
  }
}
