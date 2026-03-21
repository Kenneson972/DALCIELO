import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getSupabase } from '@/lib/supabaseAdmin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const { id } = await Promise.resolve(params)
  const numId = parseInt(id, 10)
  if (isNaN(numId)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

  const db = getSupabase()
  const { error } = await db.from('badge_categories').delete().eq('id', numId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
