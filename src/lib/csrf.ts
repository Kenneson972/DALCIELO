/**
 * Client-side CSRF helper — reads the CSRF token from the cookie set by middleware.
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match?.[1] ?? ''
}
