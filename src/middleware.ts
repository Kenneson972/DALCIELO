import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH'])
const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

export function middleware(request: NextRequest) {
  const { method, nextUrl } = request

  // Skip CSRF for Stripe webhooks (they use their own signature verification)
  if (nextUrl.pathname.startsWith('/api/webhooks/stripe')) {
    return NextResponse.next()
  }

  const existingToken = request.cookies.get(CSRF_COOKIE)?.value

  // Validate CSRF on mutating requests to API routes
  if (MUTATING_METHODS.has(method) && nextUrl.pathname.startsWith('/api/')) {
    const headerToken = request.headers.get(CSRF_HEADER)
    if (!existingToken || !headerToken || existingToken !== headerToken) {
      return NextResponse.json(
        { error: 'Jeton de sécurité invalide ou expiré. Rechargez la page.', code: 'CSRF_INVALID' },
        { status: 403 }
      )
    }
  }

  // Set CSRF cookie if missing
  const response = NextResponse.next()
  if (!existingToken) {
    const token = generateToken()
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false, // Client JS needs to read it
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }

  return response
}

export const config = {
  // Set cookie on page loads + validate on API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|sounds).*)'],
}
