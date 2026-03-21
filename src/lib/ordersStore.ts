import { randomUUID } from 'crypto'
import { getSupabase } from '@/lib/supabaseAdmin'
function getTodayInMartinique(): string {
  return new Date().toLocaleDateString('fr-CA', { timeZone: 'America/Martinique' })
}
import type { Order, OrderItem, OrderStatus } from '@/types/order'

type OrderRow = {
  id: string
  token: string
  created_at: string
  client_name: string
  client_phone: string
  client_email?: string | null
  type_service: string
  heure_souhaitee: string
  items: OrderItem[] | unknown
  total: number
  status: string
  estimated_ready_time?: string | null
  actual_ready_time?: string | null
  preparation_started_at?: string | null
  completed_at?: string | null
  notes?: string | null
  delivery_address?: string | null
  refusal_reason?: string | null
  payment_link?: string | null
  receipt_pdf_url?: string | null
  receipt_category?: string | null
}

function parseItems(items: unknown): OrderItem[] {
  if (Array.isArray(items)) return items
  if (items == null) return []
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items) as OrderItem[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function rowToOrder(row: OrderRow): Order {
  const status = (row?.status ?? 'pending_validation') as OrderStatus
  const total = Number(row?.total)
  return {
    id: String(row?.id ?? ''),
    token: String(row?.token ?? ''),
    created_at: row?.created_at ?? new Date().toISOString(),
    client_name: String(row?.client_name ?? ''),
    client_phone: String(row?.client_phone ?? ''),
    client_email: row?.client_email ?? undefined,
    type_service: row?.type_service === 'delivery' ? 'delivery' : 'click_collect',
    heure_souhaitee: String(row?.heure_souhaitee ?? ''),
    items: parseItems(row?.items),
    total: Number.isFinite(total) ? total : 0,
    status: ['pending_validation', 'waiting_payment', 'paid', 'in_preparation', 'ready', 'in_delivery', 'completed', 'cancelled', 'refused'].includes(status)
      ? status
      : 'pending_validation',
    estimated_ready_time: row?.estimated_ready_time ?? undefined,
    actual_ready_time: row?.actual_ready_time ?? undefined,
    preparation_started_at: row?.preparation_started_at ?? undefined,
    completed_at: row?.completed_at ?? undefined,
    notes: row?.notes ?? undefined,
    delivery_address: row?.delivery_address ?? undefined,
    refusal_reason: row?.refusal_reason ?? undefined,
    payment_link: row?.payment_link ?? undefined,
    receipt_pdf_url: row?.receipt_pdf_url ?? undefined,
    receipt_category: row?.receipt_category ?? undefined,
  }
}

export type OrderFilter = 'all' | 'today' | OrderStatus

export async function getOrders(filter: OrderFilter = 'all'): Promise<Order[]> {
  const supabase = getSupabase()
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(1000)

  if (filter === 'today') {
    const today = getTodayInMartinique()
    const [y, m, d] = today.split('-').map(Number)
    const start = new Date(Date.UTC(y, m - 1, d, 4, 0, 0, 0)) // 00:00 Martinique (UTC-4)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)
    query = query.gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
  } else if (filter !== 'all') {
    query = query.eq('status', filter)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => rowToOrder(row))
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('orders').select('*').eq('token', token).single()
  if (error || !data) return null
  return rowToOrder(data)
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
  if (error || !data) return null
  return rowToOrder(data)
}

export type OrderInput = Omit<Order, 'id' | 'token' | 'created_at'> & {
  id?: string
  token?: string
  created_at?: string
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const supabase = getSupabase()
  const id = input.id ?? randomUUID()
  const token = input.token ?? randomUUID()
  const created_at = input.created_at ?? new Date().toISOString()

  const row = {
    id,
    token,
    created_at,
    client_name: input.client_name,
    client_phone: input.client_phone,
    client_email: input.client_email ?? null,
    type_service: input.type_service,
    heure_souhaitee: input.heure_souhaitee,
    items: input.items,
    total: input.total,
    status: input.status,
    estimated_ready_time: input.estimated_ready_time ?? null,
    actual_ready_time: input.actual_ready_time ?? null,
    preparation_started_at: input.preparation_started_at ?? null,
    completed_at: input.completed_at ?? null,
    notes: input.notes ?? null,
    delivery_address: input.delivery_address ?? null,
    refusal_reason: input.refusal_reason ?? null,
    payment_link: input.payment_link ?? null,
  }

  const { data, error } = await supabase.from('orders').insert(row).select().single()
  if (error) throw error
  if (!data) throw new Error('Order not found after insert')
  return rowToOrder(data)
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  additionalData?: Partial<Order>
): Promise<Order | null> {
  const supabase = getSupabase()
  const now = new Date().toISOString()

  const updates: Record<string, unknown> = { status }

  if (status === 'in_preparation' && !additionalData?.preparation_started_at) {
    updates.preparation_started_at = now
  }
  if (status === 'ready' && !additionalData?.actual_ready_time) {
    updates.actual_ready_time = now
  }
  if (status === 'completed' && !additionalData?.completed_at) {
    updates.completed_at = now
  }
  if (additionalData?.estimated_ready_time != null) updates.estimated_ready_time = additionalData.estimated_ready_time
  if (additionalData?.actual_ready_time != null) updates.actual_ready_time = additionalData.actual_ready_time
  if (additionalData?.preparation_started_at != null) updates.preparation_started_at = additionalData.preparation_started_at
  if (additionalData?.completed_at != null) updates.completed_at = additionalData.completed_at
  if (additionalData?.refusal_reason != null) updates.refusal_reason = additionalData.refusal_reason
  if (additionalData?.payment_link != null) updates.payment_link = additionalData.payment_link
  if (additionalData?.notes != null) updates.notes = additionalData.notes
  if (additionalData?.delivery_address != null) updates.delivery_address = additionalData.delivery_address
  if (additionalData?.receipt_pdf_url != null) updates.receipt_pdf_url = additionalData.receipt_pdf_url
  if (additionalData?.receipt_category !== undefined) updates.receipt_category = additionalData.receipt_category ?? null

  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().maybeSingle()
  if (error) throw error
  return data ? rowToOrder(data) : null
}

/** Met à jour l’URL du reçu PDF sur la commande (appelé après upload par n8n). */
export async function setOrderReceiptPdfUrl(token: string, receiptPdfUrl: string): Promise<Order | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('orders')
    .update({ receipt_pdf_url: receiptPdfUrl })
    .eq('token', token)
    .select()
    .single()
  if (error || !data) return null
  return rowToOrder(data)
}
