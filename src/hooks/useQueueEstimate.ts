import { useEffect } from 'react'
import {
  useQueueEstimateContext,
  type QueueEstimate,
  type RealtimeStatus,
} from '@/providers/QueueEstimateProvider'

export type { QueueEstimate, RealtimeStatus }

/**
 * Consomme l'état du four / file d'attente depuis le provider singleton.
 *
 * @param enabled   - Si false, le composant ne signale pas sa priorité mais
 *                    reçoit quand même les données live du provider.
 * @param options   - cartOpen : signale que le panier est ouvert (polling accéléré).
 */
export function useQueueEstimate(
  enabled = true,
  options?: { cartOpen?: boolean }
) {
  const ctx = useQueueEstimateContext()

  // Signale au provider l'état "panier ouvert" pour activer le polling accéléré
  useEffect(() => {
    if (!enabled || !options?.cartOpen) return
    ctx.notifyCartOpen(true)
    return () => ctx.notifyCartOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, options?.cartOpen])

  return {
    estimate:       ctx.estimate,
    loading:        ctx.loading,
    isStale:        ctx.isStale,
    realtimeStatus: ctx.realtimeStatus,
    refresh:        ctx.refresh,
  }
}
