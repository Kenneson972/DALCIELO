import { NextResponse } from 'next/server'
import { getDeliveryFeeForAddress } from '@/lib/deliveryFee'

// In-memory rate-limit: 10 req/min per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

export async function GET(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')?.trim()

  if (!address || address.length < 5) {
    return NextResponse.json(
      { error: 'Paramètre address requis (min 5 caractères).' },
      { status: 400 }
    )
  }

  const result = await getDeliveryFeeForAddress(address)
  return NextResponse.json(result)
}
