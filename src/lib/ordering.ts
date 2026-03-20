/**
 * Règles métier pour la disponibilité de la commande en ligne.
 * (L’ancien flag NEXT_PUBLIC_ORDERING_ENABLED a été retiré : la commande n’est plus désactivable globalement par env.)
 */

/** Retourne le jour courant en Martinique (UTC-4) */
function getMartiniqueDay(): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Martinique',
    weekday: 'long',
  }).format(new Date())
}

/** True si aujourd'hui est lundi en Martinique */
export function isMondayClosed(): boolean {
  return getMartiniqueDay() === 'Monday'
}

/** True si aujourd'hui est dimanche en Martinique */
export function isSundayClosed(): boolean {
  return getMartiniqueDay() === 'Sunday'
}

/**
 * Raison pour laquelle les commandes sont bloquées côté UI.
 * - 'monday' → pizzeria fermée le lundi
 * - 'sunday' → pizzeria fermée le dimanche
 * - null     → commandes autorisées (sous réserve four / API)
 */
export function orderingBlockReason(): 'monday' | 'sunday' | null {
  const day = getMartiniqueDay()
  if (day === 'Monday') return 'monday'
  if (day === 'Sunday') return 'sunday'
  return null
}
