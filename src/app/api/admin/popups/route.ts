import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getAllPopups, createPopup } from '@/lib/popupsStore'
import type { PopupType, DismissMode } from '@/types/popup'

const VALID_TYPES: PopupType[] = ['chef', 'promo', 'event', 'alert']
const VALID_DISMISS_MODES: DismissMode[] = ['once_daily', 'once_session']

/**
 * GET /api/admin/popups
 * Liste tous les popups.
 */
export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const popups = await getAllPopups()
    return NextResponse.json({ popups })
  } catch (err) {
    console.error('[GET /api/admin/popups]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/admin/popups
 * Crée un nouveau popup.
 */
export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { type, title, subtitle, message, image_url, cta_label, cta_url, price, expires_at, active, dismiss_mode, priority } = body

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'type invalide (chef|promo|event|alert)' }, { status: 400 })
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'title requis' }, { status: 400 })
    }

    const popup = await createPopup({
      type,
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      message: message?.trim() || null,
      image_url: image_url?.trim() || null,
      cta_label: cta_label?.trim() || null,
      cta_url: cta_url?.trim() || null,
      price: price != null ? parseFloat(price) : null,
      expires_at: expires_at || null,
      active: Boolean(active),
      dismiss_mode: VALID_DISMISS_MODES.includes(dismiss_mode) ? dismiss_mode : 'once_daily',
      priority: typeof priority === 'number' ? priority : 0,
    })

    return NextResponse.json({ popup }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/popups]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
