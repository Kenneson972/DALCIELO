// Pizzeria coordinates — 146 Bd de la Pointe des Nègres, Bellevue, Fort-de-France
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

// ─────────────────────────────────────────────────────────────────────────────
// GEOCODEUR 1 — API Adresse (Base Adresse Nationale, gouvernement français)
// Meilleure couverture pour les adresses des DOM dont la Martinique.
// https://adresse.data.gouv.fr/api-doc/adresse
// ─────────────────────────────────────────────────────────────────────────────
interface BanFeature {
  geometry: { coordinates: [number, number] } // [lng, lat]
  properties: { label: string; citycode: string; score: number }
}

async function banGeocodeAddress(
  address: string,
  signal: AbortSignal,
): Promise<{ lat: number; lng: number; label: string } | null> {
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=5&autocomplete=0`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PizzaDalCielo/1.0' },
      signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    const features: BanFeature[] = (data.features ?? [])
      // Filtrer uniquement la Martinique (codes INSEE 972xx)
      .filter((f: BanFeature) => f.properties?.citycode?.startsWith('972'))

    if (!features.length) return null

    // Parmi les candidats, retenir celui le plus proche de la pizzeria
    let best: { lat: number; lng: number; label: string } | null = null
    let bestDist = Infinity
    for (const f of features) {
      const [lng, lat] = f.geometry.coordinates
      if (!isFinite(lat) || !isFinite(lng)) continue
      const d = haversineKm(PIZZERIA_LAT, PIZZERIA_LNG, lat, lng)
      if (d < bestDist) {
        bestDist = d
        best = { lat, lng, label: f.properties.label }
      }
    }
    return best
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOCODEUR 2 — Nominatim (OpenStreetMap) — fallback
// Moins complet pour la Martinique, mais utile pour les noms de lieux/POI.
// ─────────────────────────────────────────────────────────────────────────────

// Bounding box Martinique [min_lon, min_lat, max_lon, max_lat]
const MQ_VIEWBOX = '-61.25,14.38,-60.80,14.90'

async function nominatimFetch(
  query: string,
  signal: AbortSignal,
): Promise<{ lat: string; lon: string }[] | null> {
  const res = await fetch(query, {
    headers: { 'User-Agent': 'PizzaDalCielo/1.0' },
    signal,
  })
  if (!res.ok) return null
  const data = await res.json()
  return Array.isArray(data) && data.length > 0 ? data : null
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOCODEUR 3 — Fallback par commune/quartier martiniquais
// Utilisé quand BAN et Nominatim échouent tous les deux.
// Coordonnées approximatives des centres de commune/quartiers de Martinique.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clé = nom normalisé (sans accents, minuscules, tirets → espaces)
 * Valeur = coordonnées du centre du secteur
 */
const MARTINIQUE_COMMUNES: Record<string, { lat: number; lng: number }> = {
  // ── Quartiers de Fort-de-France ──────────────────────────────────────────
  'bellevue':             { lat: 14.621,  lng: -61.107 },
  'pointe des negres':    { lat: 14.617,  lng: -61.116 },
  'pointe negres':        { lat: 14.617,  lng: -61.116 },
  'dillon':               { lat: 14.592,  lng: -61.079 },
  'cluny':                { lat: 14.610,  lng: -61.082 },
  'sainte therese':       { lat: 14.605,  lng: -61.070 },
  'trenelle':             { lat: 14.620,  lng: -61.090 },
  'terres sainville':     { lat: 14.616,  lng: -61.062 },
  'centre ville':         { lat: 14.604,  lng: -61.058 },
  'bord de canal':        { lat: 14.598,  lng: -61.073 },
  'mangot vulcin':        { lat: 14.595,  lng: -61.064 },
  'redoute':              { lat: 14.618,  lng: -61.080 },
  'didier':               { lat: 14.634,  lng: -61.078 },
  'balata':               { lat: 14.658,  lng: -61.070 },
  'absalon':              { lat: 14.670,  lng: -61.055 },
  'desiles':              { lat: 14.603,  lng: -61.050 },
  'petit paradis':        { lat: 14.606,  lng: -61.043 },
  'volga plage':          { lat: 14.601,  lng: -61.064 },
  'bateliere':            { lat: 14.596,  lng: -61.090 },
  // ── Fort-de-France ville ─────────────────────────────────────────────────
  'fort de france':       { lat: 14.604,  lng: -61.065 },
  'fort-de-france':       { lat: 14.604,  lng: -61.065 },
  // ── Schœlcher ─────────────────────────────────────────────────────────────
  'schoelcher':           { lat: 14.622,  lng: -61.105 },
  'fond lahaye':          { lat: 14.629,  lng: -61.109 },
  'fond bois':            { lat: 14.636,  lng: -61.116 },
  'anse madame':          { lat: 14.618,  lng: -61.125 },
  'foyal':                { lat: 14.622,  lng: -61.110 },
  // ── Communes hors zone (> 7 km) ───────────────────────────────────────────
  'lamentin':             { lat: 14.608,  lng: -60.996 },
  'saint joseph':         { lat: 14.661,  lng: -61.021 },
  'saint-joseph':         { lat: 14.661,  lng: -61.021 },
  'case pilote':          { lat: 14.643,  lng: -61.124 },
  'case-pilote':          { lat: 14.643,  lng: -61.124 },
  'bellefontaine':        { lat: 14.664,  lng: -61.139 },
  'le carbet':            { lat: 14.697,  lng: -61.184 },
  'saint pierre':         { lat: 14.736,  lng: -61.177 },
  'saint-pierre':         { lat: 14.736,  lng: -61.177 },
  'gros morne':           { lat: 14.700,  lng: -60.988 },
  'trinite':              { lat: 14.739,  lng: -60.963 },
  'la trinite':           { lat: 14.739,  lng: -60.963 },
  'sainte marie':         { lat: 14.779,  lng: -60.992 },
  'le robert':            { lat: 14.717,  lng: -60.941 },
  'le francois':          { lat: 14.620,  lng: -60.895 },
  'le vauclin':           { lat: 14.558,  lng: -60.840 },
  'le marin':             { lat: 14.465,  lng: -60.874 },
  'riviere salee':        { lat: 14.530,  lng: -60.984 },
  'riviere-salee':        { lat: 14.530,  lng: -60.984 },
  'ducos':                { lat: 14.561,  lng: -60.979 },
  'riviere pilote':       { lat: 14.487,  lng: -60.922 },
  'sainte luce':          { lat: 14.479,  lng: -60.934 },
  'les trois ilets':      { lat: 14.538,  lng: -61.024 },
  'trois ilets':          { lat: 14.538,  lng: -61.024 },
  'anses d arlet':        { lat: 14.502,  lng: -61.083 },
  'le diamant':           { lat: 14.471,  lng: -61.028 },
  'sainte anne':          { lat: 14.433,  lng: -60.890 },
  'le morne rouge':       { lat: 14.762,  lng: -61.101 },
  'morne rouge':          { lat: 14.762,  lng: -61.101 },
  'le morne vert':        { lat: 14.709,  lng: -61.151 },
  'fonds saint denis':    { lat: 14.743,  lng: -61.120 },
  'grand riviere':        { lat: 14.867,  lng: -61.181 },
  'ajoupa bouillon':      { lat: 14.800,  lng: -61.085 },
  'basse pointe':         { lat: 14.858,  lng: -61.112 },
  'macouba':              { lat: 14.855,  lng: -61.141 },
  'marigot':              { lat: 14.791,  lng: -61.030 },
  'lorrain':              { lat: 14.818,  lng: -61.077 },
  'le lorrain':           { lat: 14.818,  lng: -61.077 },
}

/**
 * Normalise un texte : minuscules, sans accents, tirets → espaces
 */
function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tente de résoudre une adresse en cherchant une commune connue dans le texte.
 * Retourne les coordonnées du centre de la commune si trouvée.
 */
function communeFallback(address: string): { lat: number; lng: number } | null {
  const normalized = normalizeText(address)
  // Trier les clés par longueur décroissante (les plus spécifiques d'abord)
  const keys = Object.keys(MARTINIQUE_COMMUNES).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (normalized.includes(key)) {
      return MARTINIQUE_COMMUNES[key]
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE PRINCIPAL DE GÉOCODAGE
// Ordre : BAN → Nominatim (3 passes) → fallback commune
// ─────────────────────────────────────────────────────────────────────────────

type GeoSource = 'ban' | 'nominatim' | 'commune_fallback'

export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number; source: GeoSource } | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 9000)

  const base = 'https://nominatim.openstreetmap.org/search?format=json&limit=5'
  const nominatimPasses = [
    `${base}&countrycodes=mq&q=${encodeURIComponent(address)}`,
    `${base}&countrycodes=mq&q=${encodeURIComponent(address + ', Martinique')}`,
    `${base}&viewbox=${MQ_VIEWBOX}&bounded=0&q=${encodeURIComponent(address)}`,
  ]

  try {
    // ── Passe 1 : BAN (prioritaire) ──────────────────────────────────────────
    const banResult = await banGeocodeAddress(address, controller.signal)
    if (banResult) return { lat: banResult.lat, lng: banResult.lng, source: 'ban' }

    // ── Passes 2-4 : Nominatim ───────────────────────────────────────────────
    for (const url of nominatimPasses) {
      const results = await nominatimFetch(url, controller.signal)
      if (!results) continue
      let best: { lat: number; lng: number } | null = null
      let bestDist = Infinity
      for (const r of results) {
        const lat = parseFloat(r.lat)
        const lng = parseFloat(r.lon)
        if (!isFinite(lat) || !isFinite(lng)) continue
        const d = haversineKm(PIZZERIA_LAT, PIZZERIA_LNG, lat, lng)
        if (d < bestDist) { bestDist = d; best = { lat, lng } }
      }
      if (best) return { ...best, source: 'nominatim' }
    }

    // ── Passe 5 : Fallback commune locale ────────────────────────────────────
    const fallback = communeFallback(address)
    if (fallback) return { ...fallback, source: 'commune_fallback' }

    return null
  } catch {
    // Même en cas d'erreur (ex: timeout), tenter le fallback commune
    const fallback = communeFallback(address)
    if (fallback) return { ...fallback, source: 'commune_fallback' }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Grille tarifaire selon la distance routière estimée (vol d'oiseau × 1.35).
 * Retourne null si hors zone (> 7 km).
 */
export function computeDeliveryFee(distanceKm: number): number | null {
  if (distanceKm < 1)   return 3
  if (distanceKm < 4)   return 3.5
  if (distanceKm <= 7)  return 4
  return null // hors zone
}

export type DeliveryFeeResult =
  | { fee: number; distanceKm: number; approximated?: boolean; error?: never }
  | { fee: null; distanceKm: number | null; error: 'not_found' | 'out_of_zone'; approximated?: boolean }

/**
 * Pipeline complet : géocodage → Haversine × 1.35 → grille tarifaire.
 * Le champ `approximated: true` indique que le résultat est une estimation
 * (fallback commune) et devra être confirmé par l'équipe.
 */
export async function getDeliveryFeeForAddress(address: string): Promise<DeliveryFeeResult> {
  const coords = await geocodeAddress(address)
  if (!coords) return { fee: null, distanceKm: null, error: 'not_found' }

  const straightLine = haversineKm(PIZZERIA_LAT, PIZZERIA_LNG, coords.lat, coords.lng)
  const distanceKm = Math.round(straightLine * 1.35 * 10) / 10 // × 1.35 facteur routier, 1 décimale

  const fee = computeDeliveryFee(distanceKm)
  const approximated = coords.source === 'commune_fallback' ? true : undefined

  if (fee === null) return { fee: null, distanceKm, error: 'out_of_zone', approximated }
  return { fee, distanceKm, approximated }
}
