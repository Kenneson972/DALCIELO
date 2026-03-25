import { NextRequest, NextResponse } from 'next/server'

/**
 * PIN attendu côté serveur. En production, seul ADMIN_PIN est accepté (variable serveur,
 * jamais exposée au client). NEXT_PUBLIC_ADMIN_PIN est uniquement toléré en développement
 * local ; si quelqu'un le renseigne en production il est ignoré pour éviter que la valeur
 * soit extractible depuis le bundle client.
 */
export function getExpectedAdminPin(): string | null {
  // ADMIN_PIN est toujours prioritaire et utilisable dans tous les environnements
  if (process.env.ADMIN_PIN) return process.env.ADMIN_PIN
  // NEXT_PUBLIC_ADMIN_PIN uniquement en dev (ne pas utiliser en prod : valeur publique)
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ADMIN_PIN) {
    return process.env.NEXT_PUBLIC_ADMIN_PIN
  }
  // Fallback dev uniquement
  if (process.env.NODE_ENV === 'development') return '1234'
  return null
}

export function isAdminAuthorized(req: NextRequest): boolean {
  const expectedPin = getExpectedAdminPin()
  if (!expectedPin) return false
  const providedPin = req.headers.get('x-admin-pin') ?? ''
  if (!providedPin || providedPin.length !== expectedPin.length) return false
  // Comparaison constant-time pour éviter les timing attacks
  try {
    const { timingSafeEqual } = require('crypto') as typeof import('crypto')
    return timingSafeEqual(Buffer.from(providedPin), Buffer.from(expectedPin))
  } catch {
    return providedPin === expectedPin
  }
}

/** Réponse 401 standard pour les routes admin */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/** Réponse 503 si l'admin n'est pas configuré (pas de PIN en prod) */
export function adminNotConfiguredResponse() {
  return NextResponse.json(
    { error: 'Admin not configured' },
    { status: 503 }
  )
}

/**
 * Rate limiting simple par IP sur les échecs d'auth (401).
 * En mémoire : après maxFailures 401 pour la même IP, on refuse toute requête pendant blockDurationMs.
 */
const failureCountByIp = new Map<string, { count: number; firstAt: number }>()
const RATE_LIMIT_MAX_FAILURES = 15
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_BLOCK_MS = 15 * 60 * 1000 // 15 minutes de blocage

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function isRateLimited(req: NextRequest): boolean {
  const ip = getClientIp(req)
  const now = Date.now()
  const entry = failureCountByIp.get(ip)
  if (!entry) return false
  // Fenêtre expirée => reset
  if (now - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    failureCountByIp.delete(ip)
    return false
  }
  // Trop d'échecs => bloqué pendant RATE_LIMIT_BLOCK_MS
  if (entry.count >= RATE_LIMIT_MAX_FAILURES) {
    if (now - entry.firstAt < RATE_LIMIT_BLOCK_MS) return true
    failureCountByIp.delete(ip)
    return false
  }
  return false
}

export function recordAuthFailure(req: NextRequest): void {
  const ip = getClientIp(req)
  const now = Date.now()
  const entry = failureCountByIp.get(ip)
  if (!entry) {
    failureCountByIp.set(ip, { count: 1, firstAt: now })
    return
  }
  if (now - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    failureCountByIp.set(ip, { count: 1, firstAt: now })
    return
  }
  entry.count += 1
}

export function clearAuthFailures(req: NextRequest): void {
  const ip = getClientIp(req)
  failureCountByIp.delete(ip)
}

/**
 * Middleware-style check : si rate limited ou non autorisé, retourne la NextResponse à renvoyer, sinon null.
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (isRateLimited(req)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again later.' },
      { status: 429 }
    )
  }
  const expected = getExpectedAdminPin()
  if (!expected) return adminNotConfiguredResponse()
  if (!isAdminAuthorized(req)) return unauthorizedResponse()
  return null
}

/**
 * Vérifie l'auth admin et gère le rate limiting (enregistre l'échec sur 401, efface sur succès).
 * Retourne la réponse d'erreur à renvoyer, ou null si autorisé.
 */
export function requireAdminWithRateLimit(req: NextRequest): NextResponse | null {
  const res = requireAdmin(req)
  if (res) {
    if (res.status === 401) recordAuthFailure(req)
    return res
  }
  clearAuthFailures(req)
  return null
}
