// Pizzeria coordinates — verify before deployment via:
// https://nominatim.openstreetmap.org/search?q=146+Pointes+des+Negres+Fort-de-France&format=json
export const PIZZERIA_LAT = 14.6165
export const PIZZERIA_LNG = -61.1152

/**
 * Haversine distance between two coordinates (in km)
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Bounding box around Martinique for Nominatim viewbox bias
// [min_lon, min_lat, max_lon, max_lat]
const MQ_VIEWBOX = '-61.25,14.38,-60.80,14.90'

async function nominatimFetch(query: string, signal: AbortSignal): Promise<{ lat: string; lon: string }[] | null> {
  const res = await fetch(query, {
    headers: { 'User-Agent': 'PizzaDalCielo/1.0' },
    signal,
  })
  if (!res.ok) return null
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data : null
}

/**
 * Geocode an address via Nominatim (OpenStreetMap).
 * Uses a multi-pass strategy for best coverage in Martinique:
 *   Pass 1 — address as-is, countrycodes=mq (most precise)
 *   Pass 2 — address + "Martinique" appended (handles partial inputs)
 *   Pass 3 — address alone, viewbox biased to Martinique (last resort)
 * Returns the result closest to the pizzeria among all candidates.
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  const base = 'https://nominatim.openstreetmap.org/search?format=json&limit=5'
  const passes = [
    `${base}&countrycodes=mq&q=${encodeURIComponent(address)}`,
    `${base}&countrycodes=mq&q=${encodeURIComponent(address + ', Martinique')}`,
    `${base}&viewbox=${MQ_VIEWBOX}&bounded=0&q=${encodeURIComponent(address)}`,
  ]

  try {
    for (const url of passes) {
      const results = await nominatimFetch(url, controller.signal)
      if (!results) continue

      // Among candidates, pick the one closest to the pizzeria
      let best: { lat: number; lng: number } | null = null
      let bestDist = Infinity
      for (const r of results) {
        const lat = parseFloat(r.lat)
        const lng = parseFloat(r.lon)
        if (!isFinite(lat) || !isFinite(lng)) continue
        const d = haversineKm(PIZZERIA_LAT, PIZZERIA_LNG, lat, lng)
        if (d < bestDist) { bestDist = d; best = { lat, lng } }
      }
      if (best) return best
    }
    return null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Delivery fee grid based on route distance (straight-line × 1.35).
 * Returns null if outside the delivery zone (> 7 km).
 */
export function computeDeliveryFee(distanceKm: number): number | null {
  if (distanceKm < 1) return 3
  if (distanceKm < 4) return 3.5
  if (distanceKm <= 7) return 4
  return null // out of zone
}

export type DeliveryFeeResult =
  | { fee: number; distanceKm: number; error?: never }
  | { fee: null; distanceKm: number | null; error: 'not_found' | 'out_of_zone' }

/**
 * Full pipeline: geocode → Haversine × 1.35 → fee grid.
 */
export async function getDeliveryFeeForAddress(address: string): Promise<DeliveryFeeResult> {
  const coords = await geocodeAddress(address)
  if (!coords) return { fee: null, distanceKm: null, error: 'not_found' }

  const straightLine = haversineKm(PIZZERIA_LAT, PIZZERIA_LNG, coords.lat, coords.lng)
  const distanceKm = Math.round(straightLine * 1.35 * 10) / 10 // × 1.35 routing factor, 1 decimal

  const fee = computeDeliveryFee(distanceKm)
  if (fee === null) return { fee: null, distanceKm, error: 'out_of_zone' }

  return { fee, distanceKm }
}
