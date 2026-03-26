'use client'

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Send,
  AlertTriangle,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  Navigation,
  LocateFixed,
  RefreshCw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useQueueEstimate } from '@/hooks/useQueueEstimate'
import { Button } from '@/components/ui/Button'
import { TimeSlotPicker } from '@/components/ui/TimeSlotPicker'
import { isPreferredTimeSlotObsolete } from '@/lib/preferredTimeSlots'
import { contactInfo, menuData } from '@/data/menuData'
import { createLocalOrderId, createOrderToken, createOrder } from '@/lib/localStore'
import type { Order } from '@/types/order'
import { getCsrfToken } from '@/lib/csrf'

// ── Types BAN autocomplete ─────────────────────────────────────────────────
interface BanSuggestion {
  label: string
  lat: number
  lng: number
  city: string
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type SubmitErrorState = {
  title: string
  description: string
  code?: string
  retryable: boolean
  suggestReload?: boolean
  degradedNetwork?: boolean
}

const FALLBACK_IMAGES: Record<string, string> = {
  Boissons: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=200&auto=format&fit=crop',
  Friands: 'https://images.unsplash.com/photo-1601050690597-df056fbec7ad?q=80&w=200&auto=format&fit=crop',
  Desserts: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=200&auto=format&fit=crop',
  Pizzas: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop',
}

const getCartItemFallback = (category?: string) =>
  FALLBACK_IMAGES[category ?? ''] ?? FALLBACK_IMAGES.Pizzas

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, addItem, removeItem, updateQuantity, getTotal, getItemCount, clearCart } = useCart()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [offlineWarning, setOfflineWarning] = useState(false)
  const [ovenUnavailableWarning, setOvenUnavailableWarning] = useState(false)
  const [submitError, setSubmitError] = useState<SubmitErrorState | null>(null)
  const router = useRouter()

  // Delivery address & fee
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLandmark, setDeliveryLandmark] = useState('')
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(null)
  const [deliveryApproximated, setDeliveryApproximated] = useState(false)
  const [deliveryFeeStatus, setDeliveryFeeStatus] = useState<
    'idle' | 'loading' | 'ok' | 'not_found' | 'out_of_zone' | 'uncertain'
  >('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // BAN autocomplete
  const [banSuggestions, setBanSuggestions] = useState<BanSuggestion[]>([])
  const [banSuggestionsVisible, setBanSuggestionsVisible] = useState(false)
  const [banLoading, setBanLoading] = useState(false)
  const [addressConfirmed, setAddressConfirmed] = useState(false)
  const banDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestionsBoxRef = useRef<HTMLDivElement>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  /** Une tentative auto au passage en livraison (comme DIAMANTNOIR / villas catalogue) — réinitialisé au changement de mode */
  const deliveryAutoGeoAttemptedRef = useRef(false)

  const { estimate, loading: ovenLoading, isStale, realtimeStatus, refresh } = useQueueEstimate(
    isOpen && items.length > 0,
    { cartOpen: isOpen }
  )
  const [notes, setNotes] = useState('')
  const [rgpdConsent, setRgpdConsent] = useState(false)
  const [form, setForm] = useState({
    client_firstname: '',
    client_lastname: '',
    client_phone: '',
    type_service: 'click_collect' as 'click_collect' | 'delivery',
    heure_souhaitee: '',
  })
  /** Rafraîchit les créneaux « passés » si le panier reste ouvert (toutes les 30 s) */
  const [timeSlotTick, setTimeSlotTick] = useState(0)

  const clientName = `${form.client_firstname} ${form.client_lastname}`.trim()
  const canSubmit = useMemo(() => {
    const baseOk =
      clientName.length > 1 &&
      form.client_phone.trim().length > 6 &&
      items.length > 0
    if (!baseOk) return false
    if (ovenLoading) return false
    if (!estimate.ovenAvailable) return false
    if (form.type_service === 'delivery' && deliveryFeeStatus !== 'ok') return false
    if (!rgpdConsent) return false
    return true
  }, [clientName, form.client_phone, items.length, deliveryFeeStatus, estimate.ovenAvailable, ovenLoading, rgpdConsent])

  useEffect(() => {
    if (!isOpen) return
    const id = window.setInterval(() => setTimeSlotTick(t => t + 1), 30_000)
    return () => window.clearInterval(id)
  }, [isOpen])

  /** Si l’heure choisie vient de passer, on la retire pour éviter une commande sur un créneau obsolète */
  useEffect(() => {
    if (!isOpen) return
    setForm(f => {
      if (!f.heure_souhaitee || !isPreferredTimeSlotObsolete(f.heure_souhaitee)) return f
      return { ...f, heure_souhaitee: '' }
    })
  }, [isOpen, timeSlotTick])

  // Réinitialiser l'état "sent" à l'ouverture du tiroir pour afficher le panier à jour (vide après envoi)
  useEffect(() => {
    if (isOpen) {
      setSent(false)
      setOfflineWarning(false)
      setOvenUnavailableWarning(false)
      setSubmitError(null)
      setTimeSlotTick(t => t + 1)
    }
  }, [isOpen])

  // Reset fee + autocomplete state when switching service type
  useEffect(() => {
    setDeliveryFeeStatus('idle')
    setDeliveryFee(null)
    setDeliveryDistanceKm(null)
    setDeliveryApproximated(false)
    setDeliveryAddress('')
    setDeliveryLandmark('')
    setBanSuggestions([])
    setBanSuggestionsVisible(false)
    setAddressConfirmed(false)
    setGeoError(null)
    deliveryAutoGeoAttemptedRef.current = false
  }, [form.type_service])

  // ── BAN autocomplete ───────────────────────────────────────────────────────
  useEffect(() => {
    if (form.type_service !== 'delivery') return
    if (addressConfirmed) return
    if (banDebounceRef.current) clearTimeout(banDebounceRef.current)

    if (deliveryAddress.trim().length < 4) {
      setBanSuggestions([])
      setBanSuggestionsVisible(false)
      setBanLoading(false)
      return
    }

    setBanLoading(true)
    banDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(deliveryAddress)}&limit=6&autocomplete=1`
        )
        if (!res.ok) throw new Error('BAN API error')
        const data = await res.json()
        // Filtrer uniquement Martinique (codes INSEE 972xx)
        const suggestions: BanSuggestion[] = (data.features ?? [])
          .filter((f: { properties: { citycode?: string } }) => f.properties?.citycode?.startsWith('972'))
          .map((f: { geometry: { coordinates: [number, number] }; properties: { label: string; city: string } }) => ({
            label: f.properties.label,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            city: f.properties.city ?? '',
          }))
        setBanSuggestions(suggestions)
        setBanSuggestionsVisible(suggestions.length > 0)
      } catch {
        setBanSuggestions([])
        setBanSuggestionsVisible(false)
      } finally {
        setBanLoading(false)
      }
    }, 350)

    return () => { if (banDebounceRef.current) clearTimeout(banDebounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryAddress, form.type_service, addressConfirmed])

  // Fermer les suggestions au clic en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsBoxRef.current &&
        !suggestionsBoxRef.current.contains(e.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(e.target as Node)
      ) {
        setBanSuggestionsVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionSelect = useCallback((suggestion: BanSuggestion) => {
    setDeliveryAddress(suggestion.label)
    setAddressConfirmed(true)
    setBanSuggestionsVisible(false)
    setBanSuggestions([])
  }, [])

  /** GPS coords -> adresse lisible. BAN d'abord, Nominatim en fallback */
  const fillAddressFromCoords = useCallback(async (lat: number, lon: number) => {
    // 1. BAN reverse geocoding (meilleure couverture Martinique)
    try {
      const ctrl1 = new AbortController()
      const t1 = setTimeout(() => ctrl1.abort(), 8000)
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}&limit=5`,
        { signal: ctrl1.signal }
      ).finally(() => clearTimeout(t1))
      if (res.ok) {
        const data = await res.json()
        const features = (data.features ?? []) as { properties: { label: string; citycode: string } }[]
        const hit = features.find(f => f.properties?.citycode?.startsWith('972')) ?? features[0]
        if (hit?.properties?.label) {
          setDeliveryAddress(hit.properties.label)
          setAddressConfirmed(true)
          setBanSuggestionsVisible(false)
          setBanSuggestions([])
          return
        }
      }
    } catch (e) { void e }

    // 2. Fallback Nominatim (OpenStreetMap)
    try {
      const ctrl2 = new AbortController()
      const t2 = setTimeout(() => ctrl2.abort(), 10000)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=fr`,
        { headers: { 'User-Agent': 'PizzaDalCielo/1.0' }, signal: ctrl2.signal }
      ).finally(() => clearTimeout(t2))
      if (res.ok) {
        const data = await res.json()
        const cc = String(data?.address?.country_code ?? '')
        if (cc === 'mq' || cc === 'fr') {
          const a = data.address ?? {}
          const street = [a.house_number, a.road].filter(Boolean).join(' ')
          const locality = String(a.city ?? a.town ?? a.village ?? a.suburb ?? '')
          const label = [street, a.postcode, locality].filter(Boolean).join(', ')
          if (label.trim()) {
            setDeliveryAddress(label.trim())
            setAddressConfirmed(true)
            setBanSuggestionsVisible(false)
            setBanSuggestions([])
            return
          }
        }
      }
    } catch (e) { void e }

    setGeoError("Aucune adresse trouvée pour votre position. Saisissez-la manuellement.")
  }, [])

  // Pas d'auto-trigger géoloc : on attend le clic utilisateur pour éviter boucle et délai indéfini

  /** GPS → coordonnées → API Adresse (reverse) → libellé BAN Martinique (972xx) */
  const handleGeolocateFill = useCallback(async () => {
    if (geoLoading) return
    setGeoError(null)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.")
      return
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setGeoError('La géolocalisation nécessite une page en https (connexion sécurisée).')
      return
    }

    setGeoLoading(true)
    try {
      // Chromium / Opera : savoir si la permission est déjà refusée (aucune nouvelle boîte de dialogue)
      if (navigator.permissions?.query) {
        try {
          const status = await navigator.permissions.query({
            name: 'geolocation' as PermissionName,
          })
          if (status.state === 'denied') {
            setGeoError(
              "La localisation est refusée. Débloquez-la : icône à gauche de la barre d'adresse → Paramètres du site → Localisation → Autoriser, puis recliquez."
            )
            setGeoLoading(false)
            return
          }
        } catch {
          // API Permissions non supportée ou nom refusé : on tente quand même getCurrentPosition (déclenche la demande)
        }
      }

      // 1re tentative : position en cache (instantanée si le device en a une récente)
      const getPos = (highAccuracy: boolean, timeout: number, maxAge: number) =>
        new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: highAccuracy,
            timeout,
            maximumAge: maxAge,
          })
        )

      let pos: GeolocationPosition
      try {
        pos = await getPos(false, 5000, 300_000) // cache 5 min → réponse immédiate si disponible
      } catch {
        pos = await getPos(false, 20000, 0) // acquisition fraîche, 20s max
      }

      await fillAddressFromCoords(pos.coords.latitude, pos.coords.longitude)
    } catch (e: unknown) {
      const err = e as Partial<GeolocationPositionError> | undefined
      const code = err && typeof err === 'object' && 'code' in err ? Number((err as GeolocationPositionError).code) : NaN
      if (code === 1) {
        setGeoError("Accès refusé. Débloquez la localisation : icône à gauche de l'URL → Paramètres → Localisation → Autoriser. Sur mobile : vérifiez aussi que le GPS est activé.")
      } else if (code === 2) {
        setGeoError("Position indisponible. Saisissez l'adresse à la main.")
      } else if (code === 3) {
        setGeoError("Impossible d'obtenir votre position. Vérifiez que le GPS / la localisation est activé sur votre téléphone, puis réessayez.")
      } else {
        setGeoError("Localisation impossible. Saisissez l'adresse à la main.")
      }
    } finally {
      setGeoLoading(false)
    }
  }, [geoLoading, fillAddressFromCoords])

  // Debounce: fetch delivery fee when address changes
  useEffect(() => {
    if (form.type_service !== 'delivery') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (deliveryAddress.trim().length < 6) {
      setDeliveryFeeStatus('idle')
      setDeliveryFee(null)
      setDeliveryDistanceKm(null)
      setDeliveryApproximated(false)
      return
    }
    setDeliveryFeeStatus('loading')
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/delivery-fee?address=${encodeURIComponent(deliveryAddress.trim())}`
        )
        const data = await res.json()
        if (data.error === 'not_found') {
          setDeliveryFeeStatus('not_found')
          setDeliveryFee(null)
          setDeliveryDistanceKm(null)
          setDeliveryApproximated(false)
        } else if (data.error === 'out_of_zone') {
          setDeliveryFeeStatus('out_of_zone')
          setDeliveryFee(null)
          setDeliveryDistanceKm(data.distanceKm ?? null)
          setDeliveryApproximated(data.approximated ?? false)
        } else if (typeof data.fee === 'number' && data.approximated === true) {
          setDeliveryFeeStatus('uncertain')
          setDeliveryFee(data.fee)
          setDeliveryDistanceKm(data.distanceKm ?? null)
          setDeliveryApproximated(true)
        } else if (typeof data.fee === 'number') {
          setDeliveryFeeStatus('ok')
          setDeliveryFee(data.fee)
          setDeliveryDistanceKm(data.distanceKm ?? null)
          setDeliveryApproximated(false)
        } else {
          setDeliveryFeeStatus('not_found')
          setDeliveryFee(null)
          setDeliveryDistanceKm(null)
          setDeliveryApproximated(false)
        }
      } catch {
        setDeliveryFeeStatus('not_found')
        setDeliveryFee(null)
        setDeliveryDistanceKm(null)
        setDeliveryApproximated(false)
      }
    }, 800)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryAddress, form.type_service])

  // Remplissage automatique : nom, prénom et téléphone (localStorage + autocomplete navigateur)
  useEffect(() => {
    if (!isOpen) return
    let savedFirst = localStorage.getItem('pizza-client-firstname')
    let savedLast = localStorage.getItem('pizza-client-lastname')
    const savedPhone = localStorage.getItem('pizza-client-phone')
    // Migration depuis l'ancienne clé pizza-client-name
    if (!savedFirst && !savedLast) {
      const savedName = localStorage.getItem('pizza-client-name')
      if (savedName) {
        const parts = savedName.trim().split(/\s+/)
        savedFirst = parts[0] || ''
        savedLast = parts.slice(1).join(' ') || ''
      }
    }
    if (savedFirst || savedLast || savedPhone) {
      setForm(prev => ({
        ...prev,
        client_firstname: savedFirst || prev.client_firstname,
        client_lastname: savedLast || prev.client_lastname,
        client_phone: savedPhone || prev.client_phone,
      }))
    }
  }, [isOpen])

  const buildOrderPayloadBase = () => {
    const fullAddress =
      form.type_service === 'delivery'
        ? [deliveryAddress.trim(), deliveryLandmark.trim()].filter(Boolean).join(' — ')
        : undefined
    return {
      client_name: clientName,
      client_phone: form.client_phone.trim(),
      type_service: form.type_service,
      heure_souhaitee: form.heure_souhaitee.trim(),
      notes: notes.trim() || undefined,
      delivery_address: fullAddress,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category || 'Pizzas',
        customizations: item.customizations,
        image: item.image,
      })),
      total: getTotal(),
      status: 'pending_validation' as const,
    }
  }

  /** Secours uniquement si l’API est injoignable : enregistre dans le navigateur (pas le serveur). */
  const handleSaveOrderLocally = () => {
    if (items.length === 0) return
    localStorage.setItem('pizza-client-firstname', form.client_firstname.trim())
    localStorage.setItem('pizza-client-lastname', form.client_lastname.trim())
    localStorage.setItem('pizza-client-phone', form.client_phone.trim())
    const base = buildOrderPayloadBase()
    const order: Order = {
      id: createLocalOrderId(),
      token: createOrderToken(),
      created_at: new Date().toISOString(),
      ...base,
    }
    createOrder(order)
    clearCart()
    setSubmitError(null)
    setSent(true)
    setOfflineWarning(true)
  }

  const handleSubmit = async () => {
    if (!canSubmit || sending) return
    setSending(true)
    setSubmitError(null)

    localStorage.setItem('pizza-client-firstname', form.client_firstname.trim())
    localStorage.setItem('pizza-client-lastname', form.client_lastname.trim())
    localStorage.setItem('pizza-client-phone', form.client_phone.trim())

    const orderPayload = buildOrderPayloadBase()

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify(orderPayload),
      })

      const text = await res.text()
      let data: { order?: { token?: string }; error?: string; code?: string } = {}
      if (text) {
        try {
          data = JSON.parse(text) as typeof data
        } catch {
          data = {}
        }
      }

      if (res.ok && data?.order?.token) {
        clearCart()
        setSent(true)
        onClose()
        router.push(`/order/${data.order.token}`)
        return
      }

      if (res.status === 503 && data?.code === 'OVEN_UNAVAILABLE') {
        setOvenUnavailableWarning(true)
        return
      }

      const errMsg =
        typeof data.error === 'string' && data.error.length > 0
          ? data.error
          : `Réponse du serveur (${res.status}).`
      const code = typeof data.code === 'string' ? data.code : undefined

      if (res.status === 403) {
        setSubmitError({
          title: 'Sécurité : session expirée',
          description: errMsg,
          code,
          retryable: false,
          suggestReload: true,
        })
        return
      }

      if (res.status === 429) {
        setSubmitError({
          title: 'Trop de tentatives',
          description: errMsg,
          code: code ?? 'RATE_LIMIT',
          retryable: true,
        })
        return
      }

      if (res.status === 400) {
        setSubmitError({
          title: 'Données refusées',
          description: errMsg,
          code,
          retryable: false,
        })
        return
      }

      if (res.status === 503) {
        setSubmitError({
          title: 'Service indisponible',
          description: errMsg,
          code: code ?? 'DB_UNAVAILABLE',
          retryable: true,
        })
        return
      }

      if (res.status >= 500) {
        setSubmitError({
          title: 'Erreur serveur',
          description: errMsg,
          code,
          retryable: true,
        })
        return
      }

      setSubmitError({
        title: 'Envoi impossible',
        description: errMsg,
        code,
        retryable: false,
      })
    } catch (e: unknown) {
      const isNetwork =
        e instanceof TypeError ||
        (e instanceof Error && (e.name === 'AbortError' || e.message.toLowerCase().includes('fetch')))
      setSubmitError({
        title: 'Problème de connexion',
        description: isNetwork
          ? 'Impossible de joindre le serveur. Vérifiez votre connexion internet (Wi‑Fi ou données mobiles) puis réessayez.'
          : e instanceof Error
            ? e.message
            : 'Une erreur inattendue s’est produite.',
        retryable: true,
        degradedNetwork: isNetwork,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black">Votre Panier</h3>
                  <p className="text-sm text-gray-text">{getItemCount()} article(s)</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-cream rounded-full transition-colors touch-manipulation"
                aria-label="Fermer le panier"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {sent ? (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  {offlineWarning ? (
                    <>
                      <div className="bg-amber-100 p-6 rounded-full text-amber-600 mb-6">
                        <AlertTriangle size={36} />
                      </div>
                      <h4 className="text-xl font-black text-dark mb-3">Problème de connexion</h4>
                      <p className="text-gray-text mb-4">
                        Votre commande n&apos;a pas pu être envoyée automatiquement. Veuillez contacter l&apos;équipe de Dal Cielo directement pour passer votre commande :
                      </p>
                      <div className="space-y-3 w-full mb-6">
                        <a
                          href="https://wa.me/596696887270"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-2xl font-bold transition-colors"
                        >
                          <MessageCircle size={20} />
                          Envoyer par WhatsApp
                        </a>
                        <a
                          href="tel:+596696887270"
                          className="flex items-center justify-center gap-2 w-full border-2 border-primary text-primary py-3 px-4 rounded-2xl font-bold hover:bg-primary hover:text-white transition-colors"
                        >
                          <Phone size={20} />
                          Appeler la pizzeria
                        </a>
                      </div>
                      <Button
                        onClick={() => {
                          clearCart()
                          setSent(false)
                          setOfflineWarning(false)
                          onClose()
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Fermer
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="bg-primary/10 p-6 rounded-full text-primary mb-6">
                        <Send size={36} />
                      </div>
                      <h4 className="text-xl font-black text-dark mb-3">Commande envoyée !</h4>
                      <p className="text-gray-text mb-6">
                        L&apos;équipe de Dal Cielo vérifie les stocks. Vous recevrez le lien de paiement par WhatsApp sous 5-10 min.
                      </p>
                      <Button
                        onClick={() => {
                          clearCart()
                          setSent(false)
                          onClose()
                        }}
                        className="w-full"
                      >
                        Fermer
                      </Button>
                    </>
                  )}
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-cream p-6 rounded-full text-gray-300 mb-6">
                    <ShoppingBag size={48} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-500">Votre panier est vide</h4>
                  <p className="text-gray-400 mt-2 mb-8">
                    Découvrez notre menu et ajoutez vos pizzas préférées !
                  </p>
                  <Button onClick={onClose} variant="outline" className="border-primary text-primary">
                    Voir le Menu
                  </Button>
                </div>
              ) : (
                <>
                  {/* ── Articles ── */}
                  <div className="p-6 space-y-6">
                    {items.map((item, index) => (
                      <div key={`${item.id}-${(item.customizations ?? []).join('|')}-${index}`} className="flex gap-4 group">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={item.image || getCartItemFallback(item.category)}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-dark">{item.name}</h4>
                            <button
                              onClick={() => removeItem(item.id, item.customizations)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1">
                              {item.customizations.map((c, i) => (
                                <span key={i} className="inline-block text-[11px] font-medium bg-cream border border-[#e8d0c0] text-[#7a5540] rounded-lg px-2 py-0.5 leading-snug">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-primary font-bold mb-3">{item.price.toFixed(2)}€</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.customizations)}
                              className="min-w-[44px] min-h-[44px] rounded-lg border border-gray-200 flex items-center justify-center hover:bg-cream transition-colors touch-manipulation"
                              aria-label="Diminuer la quantité"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.customizations)}
                              className="min-w-[44px] min-h-[44px] rounded-lg border border-gray-200 flex items-center justify-center hover:bg-cream transition-colors touch-manipulation"
                              aria-label="Augmenter la quantité"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* ── Upselling ── */}
                    {(() => {
                      const hasDrink = items.some((i) => i.category === 'Boissons')
                      const hasFriand = items.some((i) => i.category === 'Friands')
                      const suggestions = !hasDrink
                        ? menuData.drinks.slice(0, 3).map((d) => ({ id: d.id, name: d.name, price: d.price, category: d.category, emoji: '🥤' }))
                        : !hasFriand
                        ? menuData.friands.slice(0, 2).map((f) => ({ id: f.id, name: f.name, price: f.price, category: f.category, emoji: '🥐' }))
                        : []
                      if (!suggestions.length) return null
                      return (
                        <div className="border-t border-gray-100 pt-5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                            Ajouter à votre commande ?
                          </p>
                          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
                            {suggestions.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => addItem({ id: s.id, name: s.name, price: s.price, category: s.category })}
                                className="flex-shrink-0 flex flex-col items-center bg-cream/60 border border-[#ead5c4] rounded-2xl px-4 py-3 gap-1 hover:bg-cream hover:border-primary transition-all active:scale-95 min-w-[80px]"
                              >
                                <span className="text-xl">{s.emoji}</span>
                                <span className="text-[11px] font-bold text-[#3D2418] text-center leading-tight max-w-[72px] line-clamp-2">{s.name}</span>
                                <span className="text-[11px] font-black text-primary mt-0.5">{s.price.toFixed(2)} €</span>
                                <span className="mt-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[11px] font-bold leading-none">+</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* ── Formulaire & Total ── */}
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100 bg-cream/20 space-y-4">
                    {/* ── Total ── */}
                    <div className="space-y-1">
                      {form.type_service === 'delivery' && deliveryFeeStatus === 'ok' && deliveryFee !== null && (
                        <>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Sous-total</span>
                            <span>{getTotal().toFixed(2)} €</span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Frais de livraison</span>
                            <span>+ {deliveryFee.toFixed(2)} €</span>
                          </div>
                          <div className="border-t border-gray-200 pt-1 flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-black text-primary text-2xl">
                              {(getTotal() + deliveryFee).toFixed(2)} €
                            </span>
                          </div>
                        </>
                      )}
                      {!(form.type_service === 'delivery' && deliveryFeeStatus === 'ok' && deliveryFee !== null) && (
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-bold">Total</span>
                          <span className="font-black text-primary text-2xl">{getTotal().toFixed(2)} €</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          id="cart-firstname"
                          type="text"
                          name="given-name"
                          placeholder="Prénom"
                          autoComplete="given-name"
                          aria-label="Prénom"
                          className="w-full px-4 py-3 min-h-[48px] rounded-2xl border border-gray-200 focus:outline-none focus:border-primary/30 touch-manipulation"
                          value={form.client_firstname}
                          onChange={(e) => setForm({ ...form, client_firstname: e.target.value })}
                        />
                        <input
                          id="cart-lastname"
                          type="text"
                          name="family-name"
                          placeholder="Nom"
                          autoComplete="family-name"
                          aria-label="Nom"
                          className="w-full px-4 py-3 min-h-[48px] rounded-2xl border border-gray-200 focus:outline-none focus:border-primary/30 touch-manipulation"
                          value={form.client_lastname}
                          onChange={(e) => setForm({ ...form, client_lastname: e.target.value })}
                        />
                      </div>
                      <input
                        id="cart-phone"
                        type="tel"
                        name="tel"
                        placeholder="Téléphone WhatsApp"
                        autoComplete="tel"
                        aria-label="Téléphone WhatsApp"
                        className="w-full px-4 py-3 min-h-[48px] rounded-2xl border border-gray-200 focus:outline-none focus:border-primary/30 touch-manipulation"
                        value={form.client_phone}
                        onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setForm({ ...form, type_service: 'click_collect' })}
                          className={`flex-1 min-h-[48px] px-4 py-3 rounded-2xl text-sm font-bold border touch-manipulation ${
                            form.type_service === 'click_collect'
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-gray-200 text-gray-600'
                          }`}
                        >
                          Click & Collect
                        </button>
                        <button
                          onClick={() => setForm({ ...form, type_service: 'delivery' })}
                          className={`flex-1 min-h-[48px] px-4 py-3 rounded-2xl text-sm font-bold border touch-manipulation ${
                            form.type_service === 'delivery'
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-gray-200 text-gray-600'
                          }`}
                        >
                          Livraison
                        </button>
                      </div>

                      {/* ── Bloc adresse livraison ── */}
                      {form.type_service === 'delivery' && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                            <MapPin size={12} />
                            Adresse de livraison *
                          </label>

                          {/* Input autocomplete BAN + bouton géolocalisation (rond) */}
                          <div>
                            <div className="flex gap-2 items-center">
                              <div className="relative flex-1 min-w-0">
                                <input
                                  ref={addressInputRef}
                                  type="text"
                                  placeholder="Numéro, rue, quartier… (ex: 12 rue des Flamboyants, Dillon)"
                                  autoComplete="off"
                                  className={`w-full px-4 py-3 pr-10 min-h-[48px] rounded-2xl border focus:outline-none focus:border-primary/30 touch-manipulation transition-colors ${
                                    addressConfirmed
                                      ? 'border-green-300 bg-green-50/30'
                                      : 'border-gray-200'
                                  }`}
                                  value={deliveryAddress}
                                  onChange={(e) => {
                                    setDeliveryAddress(e.target.value)
                                    setAddressConfirmed(false)
                                    setBanSuggestionsVisible(false)
                                    setGeoError(null)
                                  }}
                                  onFocus={() => {
                                    if (banSuggestions.length > 0) setBanSuggestionsVisible(true)
                                  }}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  {banLoading && <Loader2 size={15} className="animate-spin text-gray-400" />}
                                  {!banLoading && addressConfirmed && <CheckCircle size={15} className="text-green-500" />}
                                  {!banLoading && !addressConfirmed && deliveryAddress.length >= 4 && (
                                    <Navigation size={14} className="text-gray-300" />
                                  )}
                                </div>

                                {/* Dropdown suggestions BAN (aligné sur le champ) */}
                                <AnimatePresence>
                                  {banSuggestionsVisible && banSuggestions.length > 0 && (
                                    <motion.div
                                      ref={suggestionsBoxRef}
                                      initial={{ opacity: 0, y: -6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -4 }}
                                      transition={{ duration: 0.12 }}
                                      className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                                    >
                                      {banSuggestions.map((s, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onMouseDown={(e) => {
                                            e.preventDefault()
                                            handleSuggestionSelect(s)
                                          }}
                                          className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-cream/60 transition-colors text-left border-b border-gray-50 last:border-0"
                                        >
                                          <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium text-[#3D2418] leading-snug truncate">{s.label}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{s.city}</p>
                                          </div>
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <button
                                type="button"
                                onClick={handleGeolocateFill}
                                disabled={geoLoading}
                                title="Remplir avec ma position"
                                aria-label="Remplir l'adresse avec ma position actuelle"
                                className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-primary shadow-sm transition hover:border-primary/40 hover:bg-cream/50 disabled:opacity-60 touch-manipulation min-h-[48px] min-w-[48px]"
                              >
                                {geoLoading ? (
                                  <Loader2 size={20} className="animate-spin text-primary" aria-hidden />
                                ) : (
                                  <LocateFixed size={20} strokeWidth={2} className="text-primary" aria-hidden />
                                )}
                              </button>
                            </div>
                            {geoError && (
                              <p className="mt-1.5 text-xs text-red-600 px-0.5" role="alert">
                                {geoError}
                              </p>
                            )}
                          </div>

                          {/* Champ point de repère */}
                          <input
                            type="text"
                            placeholder="Point de repère (optionnel) — ex: en face du Carrefour, bât. B…"
                            className="w-full px-4 py-2.5 min-h-[44px] rounded-2xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:border-primary/30 text-sm text-gray-600 placeholder:text-gray-400 touch-manipulation"
                            value={deliveryLandmark}
                            onChange={(e) => setDeliveryLandmark(e.target.value)}
                            maxLength={120}
                          />

                          {/* Statuts de calcul des frais */}
                          {deliveryFeeStatus === 'loading' && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 px-1">
                              <Loader2 size={14} className="animate-spin shrink-0" />
                              <span>Calcul des frais en cours…</span>
                            </div>
                          )}
                          {deliveryFeeStatus === 'uncertain' && deliveryFee !== null && (
                            <div className="flex items-start gap-2 text-sm rounded-xl px-3 py-2 text-amber-800 bg-amber-50 border border-amber-200/80">
                              <AlertCircle size={15} className="shrink-0 mt-0.5" />
                              <span>
                                Adresse trop vague pour valider la livraison en ligne. Indiquez le{' '}
                                <strong>numéro et la rue</strong> (ou choisissez une suggestion ci-dessus).
                                <span className="block text-xs mt-1 opacity-90">
                                  Estimation indicative : ~{deliveryFee.toFixed(2)} €
                                  {deliveryDistanceKm !== null && ` (≈ ${deliveryDistanceKm} km)`} — non
                                  appliquée tant que l&apos;adresse n&apos;est pas précise.
                                </span>
                              </span>
                            </div>
                          )}
                          {deliveryFeeStatus === 'ok' && deliveryFee !== null && (
                            <div className="flex items-start gap-2 text-sm rounded-xl px-3 py-2 text-green-700 bg-green-50">
                              <CheckCircle size={15} className="shrink-0 mt-0.5" />
                              <span>
                                Frais de livraison : <strong>{deliveryFee.toFixed(2)} €</strong>
                                {deliveryDistanceKm !== null && (
                                  <span className="ml-1 opacity-75">(≈ {deliveryDistanceKm} km)</span>
                                )}
                              </span>
                            </div>
                          )}
                          {deliveryFeeStatus === 'not_found' && (
                            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                              <AlertCircle size={15} className="shrink-0" />
                              <span>Adresse introuvable — précisez la rue ou sélectionnez une suggestion.</span>
                            </div>
                          )}
                          {deliveryFeeStatus === 'out_of_zone' && (
                            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 space-y-3">
                              <p className="text-sm text-red-700 font-medium leading-snug">
                                ⚠️ Vous êtes hors de notre zone de livraison (7 km max depuis Bellevue).
                                Commandez en click &amp; collect ou appelez-nous !
                              </p>
                              <div className="flex gap-2">
                                <a
                                  href="tel:+596696887270"
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-red-200 text-red-700 text-sm font-bold hover:bg-red-50 transition-colors min-h-[44px]"
                                >
                                  <Phone size={14} />
                                  Nous appeler
                                </a>
                                <button
                                  onClick={() => setForm({ ...form, type_service: 'click_collect' })}
                                  className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors min-h-[44px]"
                                >
                                  Click &amp; Collect
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <TimeSlotPicker
                        value={form.heure_souhaitee}
                        onChange={time => setForm(f => ({ ...f, heure_souhaitee: time }))}
                      />

                      {/* ── Notes ── */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                          Notes (optionnel)
                        </label>
                        <textarea
                          placeholder="Allergies, instructions particulières, sonnette…"
                          rows={2}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary/30 resize-none text-sm touch-manipulation"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          maxLength={300}
                        />
                      </div>
                    </div>

                    {/* Bannière données obsolètes */}
                    {isStale && !ovenLoading && (
                      <div className="flex items-center justify-between gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                        <span>Statut four non actualisé</span>
                        <button
                          onClick={refresh}
                          className="font-bold underline underline-offset-2 hover:text-amber-900 transition-colors"
                        >
                          Actualiser
                        </button>
                      </div>
                    )}

                    {/* Indicateur Realtime hors ligne (discret) */}
                    {realtimeStatus === 'disconnected' && !ovenLoading && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        <span>Sync temps réel indisponible — actualisation auto toutes les 3s</span>
                      </div>
                    )}

                    {/* Temps d'attente / statut four */}
                    {ovenLoading ? (
                      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium bg-gray-50 text-gray-500">
                        <Loader2 size={18} className="animate-spin shrink-0" />
                        <span>Vérification du four…</span>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                        !estimate.ovenAvailable
                          ? 'bg-red-50 text-red-700'
                          : estimate.estimatedMinutes <= 20
                          ? 'bg-green-50 text-green-700'
                          : estimate.estimatedMinutes <= 40
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <Clock size={18} className="shrink-0" />
                        <div>
                          {!estimate.ovenAvailable ? (
                            <span className="font-black">Four temporairement indisponible</span>
                          ) : (
                            <>
                              <span className="font-black">~{estimate.estimatedMinutes} min</span>
                              <span className="ml-1">d&apos;attente estimé</span>
                            </>
                          )}
                          {estimate.ovenAvailable && estimate.totalItems > 0 && (
                            <span className="ml-1 opacity-70">
                              · {estimate.totalItems} pizza{estimate.totalItems > 1 ? 's' : ''} en cours
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {(!estimate.ovenAvailable || ovenUnavailableWarning) && !ovenLoading && (
                      <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 space-y-3">
                        <p className="text-sm text-red-700 font-medium leading-snug">
                          Le four est temporairement indisponible. La prise de commande en ligne est suspendue.
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-red-200 text-red-700 text-sm font-bold hover:bg-red-50 transition-colors min-h-[44px]"
                          >
                            <Phone size={14} />
                            Appeler
                          </a>
                          <a
                            href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors min-h-[44px]"
                          >
                            <MessageCircle size={14} />
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ── Bouton submit sticky ── */}
            {!sent && items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0 space-y-2">
                {submitError && (
                  <div
                    className="rounded-2xl border border-amber-200/90 bg-amber-50 px-3.5 py-3 space-y-2.5 mb-1"
                    role="alert"
                  >
                    <div className="flex gap-2 items-start">
                      <AlertCircle className="shrink-0 text-amber-700 mt-0.5" size={18} aria-hidden />
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-bold text-amber-950 leading-snug">{submitError.title}</p>
                        <p className="text-xs text-amber-900/90 leading-relaxed">{submitError.description}</p>
                        {submitError.code && process.env.NODE_ENV === 'development' && (
                          <p className="text-[10px] font-mono text-amber-800/70">code: {submitError.code}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-0.5">
                      {submitError.suggestReload && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-amber-300 text-amber-900 hover:bg-amber-100"
                          onClick={() => {
                            window.location.reload()
                          }}
                        >
                          <RefreshCw size={16} className="mr-2 shrink-0" aria-hidden />
                          Recharger la page
                        </Button>
                      )}
                      {submitError.retryable && (
                        <Button
                          type="button"
                          className="w-full"
                          disabled={!canSubmit || sending}
                          onClick={() => void handleSubmit()}
                        >
                          <RefreshCw size={16} className="mr-2 shrink-0" aria-hidden />
                          Réessayer
                        </Button>
                      )}
                      {submitError.degradedNetwork && (
                        <button
                          type="button"
                          onClick={handleSaveOrderLocally}
                          disabled={items.length === 0}
                          className="w-full text-center text-xs font-semibold text-amber-900/80 underline-offset-2 hover:underline py-1"
                        >
                          Enregistrer sur cet appareil uniquement (secours)
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <label className="flex items-start gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={rgpdConsent}
                    onChange={(e) => setRgpdConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary accent-primary shrink-0"
                  />
                  <span className="text-xs text-gray-500 leading-snug">
                    J&apos;accepte que mes données soient utilisées pour traiter ma commande.{' '}
                    <a href="/mentions" className="underline text-primary hover:text-primary/80">Mentions légales</a>
                  </span>
                </label>
                <Button
                  onClick={handleSubmit}
                  className="w-full py-4 text-lg"
                  size="lg"
                  disabled={!canSubmit || sending}
                >
                  {sending
                    ? 'Envoi en cours...'
                    : !estimate.ovenAvailable
                      ? 'Commandes suspendues'
                      : 'Envoyer pour validation'}
                </Button>
                <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
                  Validation manuelle par l&apos;équipe de Dal Cielo avant paiement
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
