import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint appelé par n8n/CieloBot après la création réussie d'une commande.
 * Valide la clé API partagée (N8N_ADMIN_API_KEY) et retourne 200.
 * L'admin dashboard poll toutes les 10s et détectera automatiquement la nouvelle commande.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { apiKey, orderId, trackingUrl, success } = body

    const expectedKey = process.env.N8N_ADMIN_API_KEY
    if (!expectedKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!success || !orderId) {
      return NextResponse.json({ ok: true, message: 'No action needed' })
    }

    // L'admin dashboard poll toutes les 10s et détectera la nouvelle commande automatiquement.
    // Ce endpoint sert d'accusé de réception et pourra être étendu
    // avec des push notifications ou WhatsApp Business API si besoin.
    return NextResponse.json({ ok: true, orderId, trackingUrl })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
