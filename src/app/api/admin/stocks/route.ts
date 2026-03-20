import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStocks, createStock } from '@/lib/stocksStore'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { logAdminAction } from '@/lib/auditLog'
import { getIp } from '@/lib/rateLimit'

const CreateStockSchema = z.object({
  item_id: z.string().min(1).max(128).trim(),
  name: z.string().min(1).max(255).trim(),
  category: z.string().min(1).max(64).trim(),
  quantity: z.number().int().min(0).max(1_000_000).optional(),
  min_threshold: z.number().int().min(0).max(1_000_000).optional(),
  unit: z.string().max(32).optional(),
})

export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError
  try {
    const stocks = await getStocks()
    return NextResponse.json({ stocks })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[GET /api/admin/stocks] Error:', message)
    return NextResponse.json(
      { stocks: [], databaseError: true, message: process.env.NODE_ENV === 'development' ? message : 'Database unavailable' },
      { status: 200 }
    )
  }
}

export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError
  try {
    const body = await req.json()
    const parsed = CreateStockSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const { item_id, name, category, quantity, min_threshold, unit } = parsed.data
    const stock = await createStock({
      item_id,
      name,
      category,
      quantity,
      min_threshold,
      unit,
    })
    logAdminAction({
      action: 'create_stock',
      entity_type: 'stock',
      entity_id: item_id,
      details: { name, category },
      ip: getIp(req),
    })
    return NextResponse.json({ stock }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('Duplicate entry') || message.includes('ER_DUP_ENTRY')) {
      return NextResponse.json({ error: 'Un article avec ce item_id existe déjà' }, { status: 409 })
    }
    console.error('[POST /api/admin/stocks] Error:', message)
    return NextResponse.json({ error: 'Failed to create stock' }, { status: 500 })
  }
}
