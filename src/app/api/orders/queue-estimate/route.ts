import { NextResponse } from 'next/server'
import { getOrders } from '@/lib/ordersStore'
import { DEFAULT_QUEUE_SETTINGS, getQueueSettings } from '@/lib/queueSettingsStore'

// ─── Configuration four ───────────────────────────────────────────────────────
// L'équipe de Dal Cielo peut ajuster ces valeurs selon son four
const OVEN_CAPACITY = 4      // pizzas max par fournée
const PREP_TIME_MIN  = 15    // minutes par fournée

// Catégories qui occupent le four (pizzas + friands, pas les boissons)
const COOKED_CATEGORIES = [
  'Pizzas', 'Classique', 'Du Chef', 'Friands',
]

// Statuts qui représentent une charge réelle sur le four
// (on exclut pending_validation : pas encore confirmé par L'équipe de Dal Cielo)
const ACTIVE_STATUSES = ['waiting_payment', 'paid', 'in_preparation'] as const

export async function GET() {
  let settings = DEFAULT_QUEUE_SETTINGS
  try {
    settings = await getQueueSettings()
  } catch {
    // fallback silent: on garde les valeurs par défaut
  }

  try {
    const allOrders = await getOrders('all')

    const activeOrders = allOrders.filter((o) =>
      (ACTIVE_STATUSES as readonly string[]).includes(o.status)
    )

    const countCookedItems = (orders: typeof activeOrders) => {
      let n = 0
      for (const o of orders) {
        for (const item of o.items) {
          const cat = item.category || ''
          if (COOKED_CATEGORIES.some((c) => cat.toLowerCase() === c.toLowerCase())) {
            n += item.quantity
          }
        }
      }
      return n
    }

    // ── Commandes en cours de cuisson ────────────────────────────────────────
    const inPrepOrders = activeOrders.filter((o) => o.status === 'in_preparation')
    const inPrepItems  = countCookedItems(inPrepOrders)

    // Nombre de fournées nécessaires pour les commandes en cours
    const inPrepBatches      = inPrepItems > 0 ? Math.ceil(inPrepItems / OVEN_CAPACITY) : 0
    // Fournées supplémentaires au-delà de la fournée actuellement en cuisson
    const extraInPrepBatches = Math.max(0, inPrepBatches - 1)

    // Temps restant de la fournée en cours (basé sur preparation_started_at)
    let currentBatchRemaining = inPrepItems > 0 ? PREP_TIME_MIN : 0
    if (inPrepItems > 0) {
      const started = inPrepOrders
        .map((o) => o.preparation_started_at)
        .filter(Boolean)
        .map((s) => new Date(s!).getTime())
      if (started.length > 0) {
        const earliestStart = Math.min(...started)
        const elapsedMin = (Date.now() - earliestStart) / 60_000
        currentBatchRemaining = Math.max(3, Math.ceil(PREP_TIME_MIN - elapsedMin))
      }
    }

    // ── Commandes en attente du four (paid + waiting_payment) ─────────────────
    const waitingOrders = activeOrders.filter((o) =>
      ['paid', 'waiting_payment'].includes(o.status)
    )
    const waitingItems   = countCookedItems(waitingOrders)
    const waitingBatches = waitingItems > 0 ? Math.ceil(waitingItems / OVEN_CAPACITY) : 0

    // ── Estimation totale pour la prochaine commande ──────────────────────────
    // = temps restant fournée en cours
    //   + fournées supplémentaires in_prep (si > OVEN_CAPACITY pizzas)
    //   + fournées en attente (paid/waiting_payment)
    //   + 1 fournée pour la nouvelle commande
    const totalItems = inPrepItems + waitingItems
    const autoEstimatedMinutes = Math.max(
      PREP_TIME_MIN,
      currentBatchRemaining
        + (extraInPrepBatches + waitingBatches) * PREP_TIME_MIN
        + PREP_TIME_MIN
    )

    const estimatedMinutes =
      settings.mode === 'manual' && settings.manualEstimatedMinutes
        ? settings.manualEstimatedMinutes
        : autoEstimatedMinutes

    return NextResponse.json(
      {
        totalItems,
        activeOrders: activeOrders.length,
        estimatedMinutes,
        ovenAvailable: settings.ovenAvailable,
        estimateSource: settings.mode === 'manual' ? 'manual' : 'auto',
        manualEstimatedMinutes: settings.manualEstimatedMinutes,
        ovenCapacity: OVEN_CAPACITY,
        prepTimeMinutes: PREP_TIME_MIN,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    // Fallback : on renvoie une estimation par défaut sans crasher
    return NextResponse.json(
      {
        totalItems: 0,
        activeOrders: 0,
        estimatedMinutes:
          settings.mode === 'manual' && settings.manualEstimatedMinutes
            ? settings.manualEstimatedMinutes
            : 15,
        ovenAvailable: settings.ovenAvailable,
        estimateSource: settings.mode === 'manual' ? 'manual' : 'auto',
        manualEstimatedMinutes: settings.manualEstimatedMinutes,
        ovenCapacity: OVEN_CAPACITY,
        prepTimeMinutes: PREP_TIME_MIN,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
