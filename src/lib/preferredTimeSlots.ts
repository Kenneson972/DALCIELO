/** Créneaux affichés (alignés sur les habitudes du salon / admin) */
export const PREFERRED_TIME_SLOTS = [
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
] as const

export type PreferredTimeSlot = (typeof PREFERRED_TIME_SLOTS)[number]

const MARTINIQUE_TZ = 'America/Martinique'

function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN
  return h * 60 + m
}

/** Heure locale actuelle en Martinique → minutes depuis minuit */
export function getMartiniqueNowMinutes(): number {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: MARTINIQUE_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(new Date())
  const hour = Number(parts.find(p => p.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find(p => p.type === 'minute')?.value ?? '0')
  return hour * 60 + minute
}

/** Créneau strictement dans le passé (à la minute près, heure Martinique) */
export function isPreferredTimeSlotObsolete(timeStr: string): boolean {
  const slot = timeStrToMinutes(timeStr)
  if (!Number.isFinite(slot)) return true
  return slot <= getMartiniqueNowMinutes()
}

/** Affichage FR type 19h30 (lisible, cohérent resto) */
export function formatPreferredTimeLabel(timeStr: string): string {
  return timeStr.trim().replace(':', 'h')
}
