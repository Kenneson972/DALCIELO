import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getSupabase } from '@/lib/supabaseAdmin'

const BUCKET = 'product-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Type non autorisé (JPEG, PNG, WebP, GIF)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`

    const supabase = getSupabase()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })

    if (error) {
      console.error('[POST /api/admin/upload]', error.message)
      return NextResponse.json(
        { error: error.message || 'Erreur d’upload' },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[POST /api/admin/upload]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
