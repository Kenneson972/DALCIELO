import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { updateProduct } from '@/lib/productsStore'
import { logAdminAction } from '@/lib/auditLog'
import { getIp } from '@/lib/rateLimit'

const PatchSchema = z.object({
  name:             z.string().min(1).max(120).optional(),
  slug:             z.string().min(1).max(120).optional(),
  price:            z.number().positive().optional(),
  description:      z.string().nullable().optional(),
  ingredients:      z.array(z.string()).nullable().optional(),
  image_url:        z.string().url().nullable().optional(),
  image_urls:       z.array(z.string().url()).nullable().optional(),
  slider_image_url: z.string().url().nullable().optional(),
  show_in_slider:   z.boolean().optional(),
  category:         z.string().nullable().optional(),
  size:             z.string().nullable().optional(),
  available:        z.boolean().optional(),
  popular:          z.boolean().optional(),
  vegetarian:       z.boolean().optional(),
  badge_label:      z.string().nullable().optional(),
  is_chef_special:  z.boolean().optional(),
  chef_valid_until: z.string().nullable().optional(), // "YYYY-MM-DD"
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const { id } = await Promise.resolve(params)
  const numId = parseInt(id, 10)
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation échouée', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await updateProduct(numId, parsed.data)
    logAdminAction({
      action: 'update_product',
      entity_type: 'product',
      entity_id: String(numId),
      details: parsed.data as Record<string, unknown>,
      ip: getIp(req),
    })
    return NextResponse.json({ success: true, product: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[PATCH /api/admin/products/:id]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
