export const ORDERING_ENABLED =
  process.env.NEXT_PUBLIC_ORDERING_ENABLED !== 'false'

/** True si aujourd'hui est lundi en Martinique (UTC-4) */
export function isMondayClosed(): boolean {
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Martinique',
    weekday: 'long',
  }).format(new Date())
  return day === 'Monday'
}

/**
 * Raison pour laquelle les commandes sont bloquées.
 * - 'monday'       → pizzeria fermée le lundi
 * - 'coming_soon'  → commande en ligne pas encore disponible
 * - null           → commandes disponibles
 */
export function orderingBlockReason(): 'monday' | 'coming_soon' | null {
  if (isMondayClosed()) return 'monday'
  if (!ORDERING_ENABLED) return 'coming_soon'
  return null
}
