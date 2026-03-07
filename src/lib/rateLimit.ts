const windows = new Map<string, { count: number; firstAt: number }>()

export function getIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = windows.get(ip)
  if (!entry || now - entry.firstAt > windowMs) {
    windows.set(ip, { count: 1, firstAt: now })
    return true
  }
  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}
