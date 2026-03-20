import { NextResponse } from 'next/server'
import { getActivePopup } from '@/lib/popupsStore'
import { getChefProduct } from '@/lib/productsStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Fetches séparés : une erreur popup ne doit PAS nullifier le produit du chef
  let popup = null
  let product = null
  try { popup = await getActivePopup() } catch {}
  try { product = await getChefProduct() } catch {}

  const res = NextResponse.json({ popup, product })
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return res
}
