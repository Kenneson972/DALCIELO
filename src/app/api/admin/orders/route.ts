import { NextRequest, NextResponse } from 'next/server'
import { getOrders } from '@/lib/ordersStore'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import type { OrderStatus } from '@/types/order'

export const dynamic = 'force-dynamic'

const VALID_FILTERS = ['all', 'today'] as const
const ORDER_STATUSES: OrderStatus[] = [
  'pending_validation', 'waiting_payment', 'paid', 'in_preparation',
  'ready', 'in_delivery', 'completed', 'cancelled', 'refused',
]

export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const filterParam = req.nextUrl.searchParams.get('filter')
  let filter: 'all' | 'today' | OrderStatus = 'all'
  if (VALID_FILTERS.includes(filterParam as any)) {
    filter = filterParam as 'all' | 'today'
  } else if (filterParam && ORDER_STATUSES.includes(filterParam as OrderStatus)) {
    filter = filterParam as OrderStatus
  }

  try {
    const orders = await getOrders(filter)
    return NextResponse.json({ orders })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[GET /api/admin/orders] Error:', message)
    return NextResponse.json(
      {
        orders: [],
        databaseError: true,
        message: process.env.NODE_ENV === 'development' ? message : 'Database unavailable',
      },
      { status: 200 }
    )
  }
}
