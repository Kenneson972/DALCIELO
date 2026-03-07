import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateStock, adjustStock } from '@/lib/stocksStore'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'

const AdjustSchema = z.object({ adjust: z.number().int().min(-10000).max(10000) })
const UpdateStockSchema = z.object({
  quantity: z.number().int().min(0).max(1_000_000).optional(),
  min_threshold: z.number().int().min(0).max(1_000_000).optional(),
  name: z.string().min(1).max(255).trim().optional(),
  category: z.string().min(1).max(64).trim().optional(),
  unit: z.string().max(32).optional(),
})

export async function PATCH(
  req: NextRequest,
  ctx: { params: { item_id: string } | Promise<{ item_id: string }> }
) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError
  const params = await Promise.resolve(ctx.params)
  const item_id = decodeURIComponent(params.item_id).trim()
  if (!item_id || item_id.length > 128) {
    return NextResponse.json({ error: 'item_id required (max 128 chars)' }, { status: 400 })
  }
  try {
    const body = await req.json()
    const adjustParsed = AdjustSchema.safeParse(body)
    if (adjustParsed.success) {
      const stock = await adjustStock(item_id, adjustParsed.data.adjust)
      if (!stock) return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
      return NextResponse.json({ stock })
    }
    const updateParsed = UpdateStockSchema.safeParse(body)
    if (!updateParsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: updateParsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const stock = await updateStock(item_id, updateParsed.data)
    if (!stock) return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    return NextResponse.json({ stock })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[PATCH /api/admin/stocks/:item_id] Error:', message)
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}
