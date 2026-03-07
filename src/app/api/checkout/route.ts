import { NextResponse } from 'next/server'

/**
 * Cet endpoint legacy est désactivé.
 * Le flux de paiement passe désormais par /api/orders (validation admin) + lien de paiement généré côté serveur.
 * Accepter des prix libres depuis le client crée un risque de manipulation tarifaire.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is no longer available. Use /api/orders instead.' },
    { status: 410 }
  )
}
