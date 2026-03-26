import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/ordersStore'
import { menuData } from '@/data/menuData'
import { getDeliveryFeeForAddress } from '@/lib/deliveryFee'
import { DEFAULT_QUEUE_SETTINGS, getQueueSettings } from '@/lib/queueSettingsStore'
import { checkRateLimit, getIp } from '@/lib/rateLimit'
import { getProducts } from '@/lib/productsStore'

// Catalog price map built once at module load (server-side only)
const CATALOG_PRICE = new Map<number, number>()
for (const p of menuData.pizzas)      CATALOG_PRICE.set(p.id, p.price)
for (const f of menuData.friands)     CATALOG_PRICE.set(f.id, f.price)
for (const d of menuData.drinks)      CATALOG_PRICE.set(d.id, d.price)
for (const d of menuData.desserts)    CATALOG_PRICE.set(d.id, d.price)
for (const s of menuData.supplements) CATALOG_PRICE.set(s.id, s.price)

// Maximum price above base: max sauce + total of all possible supplements
const MAX_SUPPLEMENT =
  Math.max(...menuData.sauces.map(s => s.price)) +
  menuData.supplements.reduce((sum, s) => sum + s.price, 0)

// Limites anti-abus (AUDIT_SECURITE_PROJET / AUDIT_PRE_PROD)
const MAX_ITEMS = 50
const MAX_CLIENT_NAME = 200
const MAX_CLIENT_PHONE = 30
const MAX_NOTES = 1000
const MAX_DELIVERY_ADDRESS = 500

export async function POST(req: Request) {
  const ip = getIp(req)
  if (!checkRateLimit(ip, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Trop de demandes. Patientez environ une minute puis réessayez.', code: 'RATE_LIMIT' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    let queueSettings = DEFAULT_QUEUE_SETTINGS
    try {
      queueSettings = await getQueueSettings()
    } catch {
      // Fallback silencieux si table indisponible
    }

    // Override les prix avec les valeurs live de Supabase (l'admin peut modifier les prix)
    const priceMap = new Map(CATALOG_PRICE)
    try {
      const products = await getProducts()
      for (const p of products) priceMap.set(p.menu_id, p.price)
    } catch {
      // Fallback silencieux — les prix statiques de menuData restent utilisés
    }

    const {
      client_name,
      client_phone,
      type_service,
      heure_souhaitee,
      items,
      notes,
      delivery_address,
      // total and status are intentionally ignored from the client
    } = body

    if (!queueSettings.ovenAvailable) {
      return NextResponse.json(
        {
          error: 'Le four est temporairement indisponible. Merci de contacter la pizzeria.',
          code: 'OVEN_UNAVAILABLE',
          contactPhone: '+596696887270',
          contactWhatsapp: 'https://wa.me/596696887270',
        },
        { status: 503 }
      )
    }

    const trimmedName = typeof client_name === 'string' ? client_name.trim() : ''
    const trimmedPhone = typeof client_phone === 'string' ? client_phone.trim() : ''
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Indiquez votre nom (au moins 2 caractères).', code: 'VALIDATION_NAME' },
        { status: 400 }
      )
    }
    if (trimmedName.length > MAX_CLIENT_NAME) {
      return NextResponse.json(
        { error: `client_name trop long (max ${MAX_CLIENT_NAME} caractères)` },
        { status: 400 }
      )
    }
    if (!trimmedPhone || trimmedPhone.length < 6) {
      return NextResponse.json(
        { error: 'Indiquez un numéro de téléphone valide.', code: 'VALIDATION_PHONE' },
        { status: 400 }
      )
    }
    if (trimmedPhone.length > MAX_CLIENT_PHONE) {
      return NextResponse.json(
        { error: `client_phone trop long (max ${MAX_CLIENT_PHONE} caractères)` },
        { status: 400 }
      )
    }
    if (!type_service || !['click_collect', 'delivery'].includes(type_service)) {
      return NextResponse.json(
        { error: 'Choix de service invalide (livraison ou retrait).', code: 'VALIDATION_SERVICE' },
        { status: 400 }
      )
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Votre panier est vide.', code: 'VALIDATION_ITEMS' },
        { status: 400 }
      )
    }
    if (items.length > MAX_ITEMS) {
      return NextResponse.json(
        { error: `Trop d'articles dans la commande (max ${MAX_ITEMS})` },
        { status: 400 }
      )
    }

    const trimmedNotes = notes != null ? String(notes).trim() : ''
    if (trimmedNotes.length > MAX_NOTES) {
      return NextResponse.json(
        { error: `notes trop longues (max ${MAX_NOTES} caractères)` },
        { status: 400 }
      )
    }

    // ── Validate each item price against the server-side catalog ─────────────
    for (const orderItem of items) {
      const itemId = Number(orderItem.id)
      if (!Number.isFinite(itemId)) {
        return NextResponse.json(
          { error: 'Article du panier invalide. Videz le panier et recommencez.', code: 'VALIDATION_ITEM_ID' },
          { status: 400 }
        )
      }
      const catalogPrice = priceMap.get(itemId)
      if (catalogPrice === undefined) {
        return NextResponse.json(
          { error: `Produit inconnu (réf. ${itemId}). Retirez cet article ou rechargez la page.`, code: 'UNKNOWN_PRODUCT' },
          { status: 400 }
        )
      }
      const itemPrice = Math.round(Number(orderItem.price) * 100) / 100
      const minPrice  = Math.round(catalogPrice * 100) / 100
      const maxPrice  = Math.round((catalogPrice + MAX_SUPPLEMENT) * 100) / 100
      if (!Number.isFinite(itemPrice) || itemPrice < minPrice || itemPrice > maxPrice) {
        console.error(`[orders] price mismatch — id:${itemId} name:"${orderItem.name}" sent:${itemPrice} catalog:${catalogPrice} min:${minPrice} max:${maxPrice}`)
        return NextResponse.json(
          {
            error:
              "Le prix d'un article ne correspond plus au menu (personnalisation ou catalogue périmé). Rechargez la page ou retirez l'article.",
            code: 'PRICE_MISMATCH',
            details: process.env.NODE_ENV === 'development' ? { itemId, sent: itemPrice, min: minPrice, max: maxPrice } : undefined,
          },
          { status: 400 }
        )
      }
      const qty = Number(orderItem.quantity)
      if (!Number.isInteger(qty) || qty < 1) {
        return NextResponse.json(
          { error: 'Quantité invalide pour un article du panier.', code: 'VALIDATION_QTY' },
          { status: 400 }
        )
      }
    }

    // ── Recompute total server-side; ignore client-provided value ─────────────
    let serverTotal =
      Math.round(
        items.reduce((sum: number, item: { price: number; quantity: number }) =>
          sum + Number(item.price) * Number(item.quantity), 0) * 100
      ) / 100

    // ── Delivery fee — validated and added server-side ────────────────────────
    let deliveryAddressForOrder: string | undefined
    if (type_service === 'delivery') {
      const trimmedAddress = delivery_address != null && typeof delivery_address === 'string' ? delivery_address.trim() : ''
      if (!trimmedAddress || trimmedAddress.length < 5) {
        return NextResponse.json(
          { error: 'Adresse de livraison requise.' },
          { status: 400 }
        )
      }
      if (trimmedAddress.length > MAX_DELIVERY_ADDRESS) {
        return NextResponse.json(
          { error: `Adresse trop longue (max ${MAX_DELIVERY_ADDRESS} caractères)` },
          { status: 400 }
        )
      }
      deliveryAddressForOrder = trimmedAddress
      const { fee, error: feeError, approximated } = await getDeliveryFeeForAddress(trimmedAddress)
      if (feeError === 'not_found') {
        return NextResponse.json(
          { error: 'Adresse introuvable. Vérifiez ou contactez-nous.', code: 'DELIVERY_ADDRESS_NOT_FOUND' },
          { status: 400 }
        )
      }
      if (feeError === 'out_of_zone' || fee === null) {
        return NextResponse.json(
          {
            error: 'Zone hors périmètre. Contactez-nous ou commandez en click & collect.',
            code: 'DELIVERY_OUT_OF_ZONE',
          },
          { status: 400 }
        )
      }
      if (approximated === true) {
        return NextResponse.json(
          {
            error:
              'Adresse trop imprécise pour valider la livraison automatiquement. Indiquez le numéro et la rue (ou une suggestion BAN), puis réessayez.',
            code: 'DELIVERY_ADDRESS_UNCERTAIN',
          },
          { status: 400 }
        )
      }
      serverTotal = Math.round((serverTotal + fee) * 100) / 100
    }

    const order = await createOrder({
      client_name: trimmedName,
      client_phone: trimmedPhone,
      type_service,
      heure_souhaitee: String(heure_souhaitee ?? '').trim(),
      items,
      total: serverTotal,
      status: 'pending_validation', // always forced; never trusted from client
      notes: trimmedNotes || undefined,
      delivery_address: deliveryAddressForOrder,
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('[POST /api/orders] Error:', message)
    const isDbUnavailable =
      message.includes('Supabase non configuré') ||
      message.includes('is not defined') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ER_ACCESS_DENIED') ||
      message.includes('Failed to fetch') ||
      message.includes('fetch failed')
    return NextResponse.json(
      {
        error: isDbUnavailable
          ? 'Le service est momentanément indisponible (base de données). Réessayez dans quelques instants.'
          : "L'enregistrement de la commande a échoué. Réessayez ou contactez la pizzeria.",
        code: isDbUnavailable ? 'DB_UNAVAILABLE' : 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: isDbUnavailable ? 503 : 500 }
    )
  }
}
