/**
 * Règles métier pour la disponibilité de la commande en ligne.
 * (L’ancien flag NEXT_PUBLIC_ORDERING_ENABLED a été retiré : la commande n’est plus désactivable globalement par env.)
 */

/** True si aujourd'hui est lundi en Martinique (UTC-4) */
export function isMondayClosed(): boolean {
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Martinique',
    weekday: 'long',
  }).format(new Date())
  return day === 'Monday'
}

/**
 * Raison pour laquelle les commandes sont bloquées côté UI.
 * - 'monday' → pizzeria fermée le lundi
 * - null     → commandes autorisées (sous réserve four / API)
 */
export function orderingBlockReason(): 'monday' | null {
  if (isMondayClosed()) return 'monday'
  return null
}
