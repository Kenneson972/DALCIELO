import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { updatePopup, deletePopup } from '@/lib/popupsStore'
import type { PopupType, DismissMode } from '@/types/popup'

const VALID_TYPES: PopupType[] = ['chef', 'promo', 'event', 'alert']
const VALID_DISMISS_MODES: DismissMode[] = ['once_daily', 'once_session']

interface RouteContext {
  params: { id: string }
}

/**
 * PATCH /api/admin/popups/:id
 * Met à jour un popup.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const patch: Record<string, unknown> = {}

    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type)) {
        return NextResponse.json({ error: 'type invalide' }, { status: 400 })
      }
      patch.type = body.type
    }
    if (body.title !== undefined) patch.title = String(body.title).trim()
    if ('subtitle' in body) patch.subtitle = body.subtitle?.trim() || null
    if ('message' in body) patch.message = body.message?.trim() || null
    if ('image_url' in body) patch.image_url = body.image_url?.trim() || null
    if ('cta_label' in body) patch.cta_label = body.cta_label?.trim() || null
    if ('cta_url' in body) patch.cta_url = body.cta_url?.trim() || null
    if ('price' in body) patch.price = body.price != null ? parseFloat(body.price) : null
    if ('expires_at' in body) patch.expires_at = body.expires_at || null
    if (body.active !== undefined) patch.active = Boolean(body.active)
    if (body.dismiss_mode !== undefined) {
      patch.dismiss_mode = VALID_DISMISS_MODES.includes(body.dismiss_mode)
        ? body.dismiss_mode
        : 'once_daily'
    }
    if (body.priority !== undefined) patch.priority = Number(body.priority)

    const popup = await updatePopup(params.id, patch)
    return NextResponse.json({ popup })
  } catch (err) {
    console.error('[PATCH /api/admin/popups/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/popups/:id
 * Supprime un popup.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    await deletePopup(params.id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/admin/popups/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
