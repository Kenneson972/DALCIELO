const MAX_ENTRIES = 1000
const windows = new Map<string, { count: number; firstAt: number }>()

function cleanup(windowMs: number) {
  if (windows.size <= MAX_ENTRIES) return
  const now = Date.now()
  const expired: string[] = []
  windows.forEach((entry, key) => {
    if (now - entry.firstAt > windowMs) expired.push(key)
  })
  expired.forEach((key) => windows.delete(key))
  // If still over limit after expiry cleanup, remove oldest entries
  if (windows.size > MAX_ENTRIES) {
    const entries = Array.from(windows.entries()).sort((a, b) => a[1].firstAt - b[1].firstAt)
    const toRemove = entries.slice(0, entries.length - MAX_ENTRIES)
    toRemove.forEach(([key]) => windows.delete(key))
  }
}

export function getIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  cleanup(windowMs)
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
