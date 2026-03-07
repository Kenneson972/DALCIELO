import { useEffect, useState } from 'react'

export interface QueueEstimate {
  totalItems: number
  activeOrders: number
  estimatedMinutes: number
  ovenAvailable: boolean
  estimateSource: 'auto' | 'manual'
  manualEstimatedMinutes: number | null
}

const DEFAULT: QueueEstimate = {
  totalItems: 0,
  activeOrders: 0,
  estimatedMinutes: 15,
  ovenAvailable: true,
  estimateSource: 'auto',
  manualEstimatedMinutes: null,
}

/**
 * Récupère l'estimation dynamique du temps d'attente basée
 * sur les pizzas actuellement en file chez Guylian.
 * Rafraîchissement toutes les 30 secondes.
 */
export function useQueueEstimate(enabled = true) {
  const [estimate, setEstimate] = useState<QueueEstimate>(DEFAULT)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!enabled) return

    const load = async () => {
      try {
        const res  = await fetch('/api/orders/queue-estimate', {
          cache: 'no-store',
          headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
        })
        const data = await res.json().catch(() => null)
        if (data && typeof data.estimatedMinutes === 'number') {
          setEstimate(data)
        }
      } catch {
        // garde la valeur précédente
      } finally {
        setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 10_000)
    return () => clearInterval(interval)
  }, [enabled])

  return { estimate, loading }
}
