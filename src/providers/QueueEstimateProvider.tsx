'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase, supabaseEnabled } from '@/lib/supabaseClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QueueEstimate {
  totalItems: number
  activeOrders: number
  estimatedMinutes: number
  ovenAvailable: boolean
  estimateSource: 'auto' | 'manual'
  manualEstimatedMinutes: number | null
}

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected'

export interface QueueEstimateContextValue {
  estimate: QueueEstimate
  loading: boolean
  isStale: boolean
  realtimeStatus: RealtimeStatus
  refresh: () => void
  notifyCartOpen: (open: boolean) => void
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_ESTIMATE: QueueEstimate = {
  totalItems: 0,
  activeOrders: 0,
  estimatedMinutes: 15,
  ovenAvailable: false, // pessimiste : on attend la confirmation avant d'autoriser la commande
  estimateSource: 'auto',
  manualEstimatedMinutes: null,
}

const LS_KEY     = 'dalcielo-oven-cache'
const STALE_MS   = 30_000   // 30s sans update → données signalées obsolètes
const POLL_NORMAL  = 15_000  // 15s — pages passives (Hero, suivi commande)
const POLL_CART_OK = 5_000   // 5s  — panier ouvert + Realtime connecté
const POLL_CART_KO = 3_000   // 3s  — panier ouvert + Realtime déconnecté (mode dégradé)

// ─── Cache localStorage ───────────────────────────────────────────────────────

function loadCache(): QueueEstimate | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > 5 * 60_000) return null // > 5 min → ignorer
    return data as QueueEstimate
  } catch { return null }
}

function saveCache(data: QueueEstimate) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const QueueEstimateContext = createContext<QueueEstimateContextValue>({
  estimate: DEFAULT_ESTIMATE,
  loading: true,
  isStale: false,
  realtimeStatus: 'connecting',
  refresh: () => {},
  notifyCartOpen: () => {},
})

export function useQueueEstimateContext() {
  return useContext(QueueEstimateContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function QueueEstimateProvider({ children }: { children: React.ReactNode }) {
  // Initialisation depuis le cache localStorage pour un rendu instantané
  const cached = typeof window !== 'undefined' ? loadCache() : null

  const [estimate,       setEstimate]       = useState<QueueEstimate>(cached ?? DEFAULT_ESTIMATE)
  const [loading,        setLoading]        = useState<boolean>(cached === null)
  const [isStale,        setIsStale]        = useState<boolean>(false)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')

  // Refs — accès sans dépendances stales dans les callbacks
  const realtimeStatusRef = useRef<RealtimeStatus>('connecting')
  const cartOpenRef       = useRef<boolean>(false)
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const staleTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const markFresh = useCallback((data: QueueEstimate) => {
    setEstimate(data)
    setLoading(false)
    setIsStale(false)
    saveCache(data)
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current)
    staleTimerRef.current = setTimeout(() => setIsStale(true), STALE_MS)
  }, [])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/queue-estimate', {
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
      })
      const data = await res.json().catch(() => null)
      if (data && typeof data.estimatedMinutes === 'number') {
        markFresh(data)
      }
    } catch {
      // Réseau KO → on garde la valeur précédente, le stale timer s'occupera du reste
    } finally {
      setLoading(false)
    }
  }, [markFresh])

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const cart   = cartOpenRef.current
    const rtOk   = realtimeStatusRef.current === 'connected'
    const ms     = cart ? (rtOk ? POLL_CART_OK : POLL_CART_KO) : POLL_NORMAL
    intervalRef.current = setInterval(load, ms)
  }, [load])

  const refresh = useCallback(() => { load() }, [load])

  const notifyCartOpen = useCallback((open: boolean) => {
    cartOpenRef.current = open
    startPolling() // redémarrer avec la bonne fréquence
  }, [startPolling])

  // ── Montage : premier chargement + Supabase Realtime ─────────────────────────

  useEffect(() => {
    load()
    startPolling()

    if (!supabaseEnabled || !supabase) {
      setRealtimeStatus('disconnected')
      realtimeStatusRef.current = 'disconnected'
      return () => {
        if (intervalRef.current)  clearInterval(intervalRef.current)
        if (staleTimerRef.current) clearTimeout(staleTimerRef.current)
      }
    }

    // ── Channel 1 : queue_settings — statut four on/off, mode, minutes manuelles ──
    const settingsChannel = supabase
      .channel('dalcielo_queue_settings')
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'queue_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          // Mise à jour instantanée du statut four sans passer par l'API
          const row = payload.new as {
            oven_available:           boolean
            mode:                     string
            manual_estimated_minutes: number | null
          }
          setEstimate(prev => {
            const updated: QueueEstimate = {
              ...prev,
              ovenAvailable:          row.oven_available,
              estimateSource:         (row.mode === 'manual' ? 'manual' : 'auto') as 'auto' | 'manual',
              manualEstimatedMinutes: row.manual_estimated_minutes,
              estimatedMinutes:
                row.mode === 'manual' && row.manual_estimated_minutes
                  ? row.manual_estimated_minutes
                  : prev.estimatedMinutes,
            }
            saveCache(updated)
            return updated
          })
          setLoading(false)
          setIsStale(false)
          if (staleTimerRef.current) clearTimeout(staleTimerRef.current)
          staleTimerRef.current = setTimeout(() => setIsStale(true), STALE_MS)
        }
      )
      .subscribe((status) => {
        const st: RealtimeStatus =
          status === 'SUBSCRIBED'                                                       ? 'connected'    :
          status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED'  ? 'disconnected' :
          'connecting'
        setRealtimeStatus(st)
        realtimeStatusRef.current = st
        startPolling()
      })

    // ── Channel 2 : orders — recalcul immédiat quand un statut de commande change ──
    // (annulée, livrée, en préparation, préparation démarrée, etc.)
    const ordersChannel = supabase
      .channel('dalcielo_orders_status')
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'orders',
        },
        () => {
          // On ne lit pas le payload (trop complexe à recalculer ici) —
          // on déclenche simplement un refresh immédiat de l'API
          load()
        }
      )
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'orders',
        },
        () => { load() }
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(settingsChannel)
      supabase!.removeChannel(ordersChannel)
      if (intervalRef.current)  clearInterval(intervalRef.current)
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // exécuté une seule fois au montage ; load/startPolling sont stables

  // ── Pause/reprise sur visibilitychange ────────────────────────────────────

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        load()       // fetch immédiat au retour sur l'onglet
        startPolling()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [load, startPolling])

  return (
    <QueueEstimateContext.Provider
      value={{ estimate, loading, isStale, realtimeStatus, refresh, notifyCartOpen }}
    >
      {children}
    </QueueEstimateContext.Provider>
  )
}
