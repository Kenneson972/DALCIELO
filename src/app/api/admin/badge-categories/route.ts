import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getSupabase } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const db = getSupabase()
  const { data, error } = await db
    .from('badge_categories')
    .select('id, name')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data ?? [] })
}

const CreateSchema = z.object({
  name: z.string().min(1).max(60),
})

export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const body = await req.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })

  const db = getSupabase()
  const { data, error } = await db
    .from('badge_categories')
    .insert({ name: parsed.data.name.trim() })
    .select()
    .single()

  if (error) {
    const msg = error.code === '23505' ? 'Ce badge existe déjà' : error.message
    return NextResponse.json({ error: msg }, { status: 409 })
  }
  return NextResponse.json({ category: data }, { status: 201 })
}
