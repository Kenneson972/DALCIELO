import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getSupabase } from '@/lib/supabaseAdmin'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  prenom: z.string().min(1).max(100).optional(),
  phone: z.string().min(6).max(30).optional(),
  pizza_habituelle: z.string().max(200).optional().nullable(),
  fidelity_points: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional().nullable(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Ce numéro de téléphone existe déjà.' }, { status: 409 })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
  return NextResponse.json({ client: data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const supabase = getSupabase()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ success: true })
}
