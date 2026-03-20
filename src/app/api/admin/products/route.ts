import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getProducts, createProduct } from '@/lib/productsStore'
import { logAdminAction } from '@/lib/auditLog'
import { getIp } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const products = await getProducts()
    return NextResponse.json({ products })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[GET /api/admin/products]', message)
    return NextResponse.json({ error: 'Impossible de charger les produits', products: [] }, { status: 500 })
  }
}

const CreateSchema = z.object({
  type:             z.enum(['pizza', 'friand', 'drink']),
  name:             z.string().min(1).max(120),
  price:            z.number().positive(),
  category:         z.string().nullable().optional(),
  description:      z.string().nullable().optional(),
  ingredients:      z.array(z.string()).nullable().optional(),
  image_url:        z.string().url().nullable().optional(),
  image_urls:       z.array(z.string().url()).nullable().optional(),
  slider_image_url: z.string().url().nullable().optional(),
  show_in_slider:   z.boolean().optional(),
  size:             z.string().nullable().optional(),
  available:        z.boolean().optional(),
  popular:          z.boolean().optional(),
  vegetarian:       z.boolean().optional(),
  premium:          z.boolean().optional(),
  sauce_au_choix:   z.boolean().optional(),
  is_chef_special:  z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation échouée', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const product = await createProduct(parsed.data)
    logAdminAction({
      action: 'create_product',
      entity_type: 'product',
      entity_id: String(product?.id ?? ''),
      details: { name: parsed.data.name, type: parsed.data.type },
      ip: getIp(req),
    })
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[POST /api/admin/products]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
