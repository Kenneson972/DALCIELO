'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, Send, AlertTriangle, Phone, MessageCircle, Clock, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useQueueEstimate } from '@/hooks/useQueueEstimate'
import { Button } from '@/components/ui/Button'
import { contactInfo, menuData } from '@/data/menuData'
import { supabase, supabaseEnabled } from '@/lib/supabaseClient'
import { createLocalOrderId, createOrderToken, createOrder } from '@/lib/localStore'
import type { Order } from '@/types/order'
import { getCsrfToken } from '@/lib/csrf'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
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
  const router = useRouter()

  // Delivery address & fee
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(null)
  const [deliveryFeeStatus, setDeliveryFeeStatus] = useState<
    'idle' | 'loading' | 'ok' | 'not_found' | 'out_of_zone'
  >('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Réinitialiser l'état "sent" à l'ouverture du tiroir pour afficher le panier à jour (vide après envoi)
  useEffect(() => {
    if (isOpen) {
      setSent(false)
      setOfflineWarning(false)
      setOvenUnavailableWarning(false)
    }
  }, [isOpen])

  // Reset fee state when switching service type
  useEffect(() => {
    setDeliveryFeeStatus('idle')
    setDeliveryFee(null)
    setDeliveryDistanceKm(null)
    setDeliveryAddress('')
  }, [form.type_service])

  // Debounce: fetch delivery fee when address changes
  useEffect(() => {
    if (form.type_service !== 'delivery') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (deliveryAddress.trim().length < 8) {
      setDeliveryFeeStatus('idle')
      setDeliveryFee(null)
      setDeliveryDistanceKm(null)
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
        } else if (data.error === 'out_of_zone') {
          setDeliveryFeeStatus('out_of_zone')
          setDeliveryFee(null)
          setDeliveryDistanceKm(data.distanceKm ?? null)
        } else if (typeof data.fee === 'number') {
          setDeliveryFeeStatus('ok')
          setDeliveryFee(data.fee)
          setDeliveryDistanceKm(data.distanceKm ?? null)
        } else {
          setDeliveryFeeStatus('not_found')
          setDeliveryFee(null)
          setDeliveryDistanceKm(null)
        }
      } catch {
        setDeliveryFeeStatus('not_found')
        setDeliveryFee(null)
        setDeliveryDistanceKm(null)
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

  const handleSubmit = async () => {
    if (!canSubmit || sending) return
    setSending(true)

    // Sauvegarder les infos pour la prochaine fois (remplissage automatique)
    localStorage.setItem('pizza-client-firstname', form.client_firstname.trim())
    localStorage.setItem('pizza-client-lastname', form.client_lastname.trim())
    localStorage.setItem('pizza-client-phone', form.client_phone.trim())

    const orderPayload = {
      client_name: clientName,
      client_phone: form.client_phone.trim(),
      type_service: form.type_service,
      heure_souhaitee: form.heure_souhaitee.trim(),
      notes: notes.trim() || undefined,
      delivery_address: form.type_service === 'delivery' ? deliveryAddress.trim() : undefined,
      items: items.map((item) => ({
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

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify(orderPayload),
      })
      const data = await res.json().catch(() => ({}))
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

      throw new Error(data?.error || `Erreur ${res.status}`)
    } catch (apiError) {
      const order: Order = {
        id: createLocalOrderId(),
        token: createOrderToken(),
        created_at: new Date().toISOString(),
        ...orderPayload,
      }
      if (supabaseEnabled && supabase) {
        try {
          const { error } = await supabase.from('orders').insert([order])
          if (!error) {
            clearCart()
            setSent(true)
            onClose()
            router.push(`/order/${order.token}`)
            return
          }
        } catch (_) {}
      }
      createOrder(order)
      clearCart()
      setSent(true)
      setOfflineWarning(true)
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
                          <input
                            type="text"
                            placeholder="Numéro, rue, quartier…"
                            autoComplete="street-address"
                            className="w-full px-4 py-3 min-h-[48px] rounded-2xl border border-gray-200 focus:outline-none focus:border-primary/30 touch-manipulation"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                          />
                          {deliveryFeeStatus === 'loading' && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 px-1">
                              <Loader2 size={14} className="animate-spin shrink-0" />
                              <span>Calcul des frais en cours…</span>
                            </div>
                          )}
                          {deliveryFeeStatus === 'ok' && deliveryFee !== null && (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">
                              <CheckCircle size={15} className="shrink-0" />
                              <span>
                                Frais de livraison : <strong>{deliveryFee.toFixed(2)} €</strong>
                                {deliveryDistanceKm !== null && (
                                  <span className="text-green-600 ml-1">(≈ {deliveryDistanceKm} km)</span>
                                )}
                              </span>
                            </div>
                          )}
                          {deliveryFeeStatus === 'not_found' && (
                            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                              <AlertCircle size={15} className="shrink-0" />
                              <span>Adresse introuvable — vérifiez ou précisez.</span>
                            </div>
                          )}
                          {deliveryFeeStatus === 'out_of_zone' && (
                            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 space-y-3">
                              <p className="text-sm text-red-700 font-medium leading-snug">
                                ⚠️ Malheureusement, vous vous situez hors de notre périmètre de livraison.
                                Contactez-nous directement ou commandez en click &amp; collect !
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

                      {/* Sélecteur d'horaire */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                          Heure souhaitée
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"].map((time) => (
                            <button
                              key={time}
                              onClick={() => setForm({ ...form, heure_souhaitee: time })}
                              className={`px-2 py-3 rounded-xl text-sm font-bold border transition-all ${
                                form.heure_souhaitee === time
                                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-cream/30'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

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
