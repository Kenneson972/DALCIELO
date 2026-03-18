const BASE_URL = 'https://pizzadalcielo.com'

export function getBaseUrl(): string {
  return BASE_URL
}

export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return BASE_URL
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${BASE_URL}${path}`
}

export const META_DESC_MAX = 155

export function truncateMetaDescription(text: string, max = META_DESC_MAX): string {
  const value = (text ?? '').trim()
  if (value.length <= max) return value
  return value.slice(0, max - 3).trim() + '…'
}

export function getDefaultOgImageUrl(): string {
  // L'asset og-image peut manquer en dev/prod; fallback sûr vers le logo.
  return absoluteUrl('/images/logo.png')
}

