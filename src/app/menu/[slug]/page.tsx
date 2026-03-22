import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import Link from 'next/link'
import { getMenuItemBySlug, getAllSlugs, type MenuItem } from '@/lib/menuUtils'
import { getProductBySlug } from '@/lib/productsStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/menu/AddToCartButton'
import { ProductImageGallery } from '@/components/menu/ProductImageGallery'
import { ProductDetailTabs } from '@/components/menu/ProductDetailTabs'
import { ChefValidUntilTimer } from '@/components/ui/ChefValidUntilTimer'
/** Chunk séparé : évite erreurs webpack « factory undefined » sur certaines résolutions lucide / client. */
const ChefPizzaPage = dynamic(
  () =>
    import('@/components/menu/ChefPizzaPage').then((m) => ({
      default: m.ChefPizzaPage,
    })),
  {
    loading: () => (
      <div className="min-h-[70vh] bg-[#0f0a05] flex flex-col items-center justify-center gap-4 px-4">
        <div
          className="h-10 w-10 rounded-full border-2 border-amber-500/25 border-t-amber-500 animate-spin"
          aria-hidden
        />
        <p className="text-sm text-white/50">Chargement…</p>
      </div>
    ),
    ssr: true,
  }
)
import { ProductReviews } from '@/components/menu/ProductReviews'
import { ArrowLeft } from 'lucide-react'
import { menuData } from '@/data/menuData'
import { absoluteUrl, getDefaultOgImageUrl, truncateMetaDescription } from '@/lib/seo'
import { InlineJsonLd } from '@/components/seo/InlineJsonLd'
import { getApprovedReviews, getReviewStats } from '@/lib/reviewsStore'

export const revalidate = 0

const PIZZA_IDS_SAUCE_AU_CHOIX = new Set([201, 202, 203, 204, 205, 206, 207, 208, 210, 211, 213, 214, 215])

const VARIANTE_CHOIX_MAP = new Map<number, { count: number; options: string[] }>()
for (const p of menuData.pizzas)  { if (p.varianteChoix) VARIANTE_CHOIX_MAP.set(p.id, p.varianteChoix) }
for (const f of menuData.friands) { if (f.varianteChoix) VARIANTE_CHOIX_MAP.set(f.id, f.varianteChoix) }

const EXTRA_BASES_MAP = new Map<number, { id: number; name: string; price: number }[]>()
for (const p of menuData.pizzas) { if (p.extraBases) EXTRA_BASES_MAP.set(p.id, p.extraBases) }
const BASE_URL = absoluteUrl('/')

interface PageProps {
  params: { slug: string }
}

async function getItem(slug: string): Promise<(MenuItem & { images?: string[] }) | null> {
  try {
    const product = await getProductBySlug(slug)
    if (product) {
      // Produit désactivé → introuvable (404)
      if (!product.available) return null
      const isPizza = product.type === 'pizza'
      const imageUrls = (product as { image_urls?: string[] | null }).image_urls
      const images = imageUrls?.length ? imageUrls : (product.image_url ? [product.image_url] : [])
      return {
        id: product.menu_id,
        name: product.name,
        price: product.price,
        category: product.category ?? undefined,
        ingredients: product.ingredients ?? undefined,
        description: product.description ?? undefined,
        image: product.image_url ?? images[0] ?? undefined,
        images: images.length ? images : undefined,
        popular: product.popular,
        vegetarian: product.vegetarian,
        badgeLabels: product.badge_labels ?? [],
        type: product.type,
        size: product.size ?? undefined,
        sauceAuChoix: isPizza && PIZZA_IDS_SAUCE_AU_CHOIX.has(product.menu_id),
        varianteChoix: VARIANTE_CHOIX_MAP.get(product.menu_id),
        extraBases: EXTRA_BASES_MAP.get(product.menu_id),
        chef_valid_until: product.chef_valid_until ?? undefined,
      }
    }
  } catch {
    // fallback to static
  }
  const fromStatic = await getMenuItemBySlug(slug)
  return fromStatic ? { ...fromStatic, images: fromStatic.image ? [fromStatic.image] : undefined } : null
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getItem(params.slug)
  if (!item) return { title: 'Produit introuvable' }
  const rawDesc = item.description || item.ingredients?.join(', ') || `Découvrez ${item.name} - ${item.price}€`
  const description = truncateMetaDescription(rawDesc)
  const ogImage = item.image ? absoluteUrl(item.image) : getDefaultOgImageUrl()
  return {
    /** Seul le nom du produit : le layout ajoute ` | Pizza Dal Cielo` (évite doublon SEO). */
    title: item.name,
    description,
    alternates: { canonical: `${BASE_URL}/menu/${params.slug}` },
    openGraph: {
      title: `${item.name} | Pizza Dal Cielo`,
      description,
      url: `${BASE_URL}/menu/${params.slug}`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: item.name }],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const item = await getItem(params.slug)
  if (!item) notFound()

  const isPizza = item.type === 'pizza'
  const isFriand = item.type === 'friand'
  const isDrink = item.type === 'drink'
  const isDessert = item.type === 'dessert'
  const isChefPizza = item.category === 'Du Chef'

  const fallbackImage = isPizza
    ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop'
    : isDrink
      ? 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop'
      : isDessert
        ? 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1601050690597-df056fbec7ad?q=80&w=800&auto=format&fit=crop'
  const images = item.images?.length ? item.images : (item.image ? [item.image] : [fallbackImage])

  if (isChefPizza) {
    return <ChefPizzaPage item={item} images={images} />
  }

  const categoryLabel =
    item.category ||
    (isPizza ? 'Pizza signature' : isFriand ? 'Friand' : isDrink ? 'Boisson' : isDessert ? 'Dessert' : 'Menu')

  // Logique Upsell : Proposer des boissons ou friands
  // Si c'est une pizza -> boissons et friands
  // Si c'est un friand -> boissons
  // Si c'est une boisson -> friands
  let upsellItems: MenuItem[] = []
  if (isPizza) {
    upsellItems = [...menuData.drinks.slice(0, 2), ...menuData.friands.slice(0, 1)].map(i => ({...i, type: i.category === 'Boissons' ? 'drink' : 'friand'} as MenuItem))
  } else if (isFriand) {
    upsellItems = menuData.drinks.slice(0, 3).map(i => ({...i, type: 'drink'} as MenuItem))
  } else if (isDrink) {
    upsellItems = menuData.friands.slice(0, 2).map(i => ({...i, type: 'friand'} as MenuItem))
  } else if (isDessert) {
    upsellItems = menuData.drinks.slice(0, 2).map(i => ({...i, type: 'drink'} as MenuItem))
  }

  let reviewStats: { total: number; average: number } | null = null
  let reviewsForSchema: Array<{ author_name: string; rating: number; comment: string | null; created_at: string }> = []
  try {
    const [stats, reviews] = await Promise.all([
      getReviewStats(item.id),
      getApprovedReviews(item.id),
    ])
    reviewStats = stats.total > 0 ? { total: stats.total, average: stats.average } : null
    reviewsForSchema = (reviews ?? []).slice(0, 10)
  } catch {
    // silencieux : Supabase/reviews indisponibles → pas de schema reviews
  }

  const productUrl = absoluteUrl(`/menu/${params.slug}`)
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: truncateMetaDescription(item.description || item.ingredients?.join(', ') || item.name),
    image: images.map((img) => absoluteUrl(img)),
    url: productUrl,
    brand: { '@type': 'Brand', name: 'Pizza Dal Cielo' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: String(item.price),
      availability: 'https://schema.org/InStock',
    },
    ...(reviewStats
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(reviewStats.average),
            reviewCount: String(reviewStats.total),
            bestRating: '5',
            worstRating: '1',
          },
          review: reviewsForSchema
            .filter((r) => r.author_name && r.rating)
            .map((r) => ({
              '@type': 'Review',
              reviewRating: {
                '@type': 'Rating',
                ratingValue: String(r.rating),
                bestRating: '5',
                worstRating: '1',
              },
              author: { '@type': 'Person', name: r.author_name },
              ...(r.comment ? { reviewBody: r.comment } : {}),
              datePublished: r.created_at,
            })),
        }
      : {}),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Menu', item: absoluteUrl('/menu') },
      { '@type': 'ListItem', position: 3, name: item.name, item: productUrl },
    ],
  }

  return (
    <div className="page-wrapper">
      <InlineJsonLd schema={[breadcrumbSchema, productSchema]} />
      <div className="pt-28 pb-20 px-4 md:px-6">
        <div className="w-full max-w-[920px] mx-auto">

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-[#7a5540] hover:text-primary transition-colors mb-5 group font-medium min-h-[44px] py-2"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform shrink-0" />
            Retour au menu
          </Link>

          {/* ═══ BLOC 1 — Galerie images (indépendant) ═══ */}
          <div
            className="rounded-2xl overflow-hidden border border-white/50 mb-4"
            style={{
              boxShadow: '0 2px 0 rgba(255,255,255,0.7) inset, 0 20px 50px -10px rgba(100,50,20,0.3), 0 10px 25px -10px rgba(0,0,0,0.15)',
            }}
          >
            <ProductImageGallery
              images={images}
              alt={item.name}
              priority
              layout="banner"
              badges={
                <>
                  {item.popular && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white bg-gradient-to-br from-primary to-secondary shadow-md">
                      ⭐ Populaire
                    </span>
                  )}
                  {item.vegetarian && <Badge text="Végétarien" variant="vegetarian" />}
                  {item.badgeLabels?.map(l => <Badge key={l} text={l} variant="premium" />)}
                  {isChefPizza && <Badge text="🌟 Du Chef" variant="premium" className="bg-yellow-500 text-yellow-900" />}
                </>
              }
            />
          </div>

          {/* ═══ BLOC 2 — Informations produit (indépendant) ═══ */}
          <div
            className="rounded-2xl overflow-hidden border border-white/75 px-4 sm:px-6 md:px-10 py-7 md:py-10"
            style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 2px 0 rgba(255,255,255,0.9) inset, 0 30px 60px -12px rgba(160,80,30,0.25), 0 18px 36px -18px rgba(0,0,0,0.1)',
            }}
          >
            {isChefPizza && (
              <div className="mb-6 p-4 bg-[#1a0f08] rounded-xl border border-[#3d2418]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌟</span>
                    <div>
                      <h3 className="text-base font-black text-[#FFF8F0]">Édition Limitée</h3>
                      <p className="text-[#b07050] text-xs">Cette création exclusive change tous les 15 jours selon l&apos;inspiration du Chef !</p>
                    </div>
                  </div>
                  {item.chef_valid_until && <ChefValidUntilTimer validUntil={item.chef_valid_until} variant="dark" />}
                </div>
              </div>
            )}

            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              {isPizza ? '🍕' : isFriand ? '🥐' : isDrink ? '🥤' : isDessert ? '🍮' : ''} {categoryLabel}
            </p>
            <h1 className="font-playfair text-2xl sm:text-3xl md:text-[2.6rem] font-bold text-[#2d1a0e] leading-tight mb-1">
              {item.name}
            </h1>
            {item.size && (
              <p className="font-playfair italic text-base text-[#b07050] mb-4">
                Format : {item.size}
              </p>
            )}

            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-playfair text-[2.2rem] sm:text-4xl md:text-5xl font-black text-primary tracking-tight drop-shadow-sm">
                {item.price}<span className="text-xl sm:text-2xl md:text-3xl align-top ml-1">€</span>
              </span>
            </div>

            {item.description && (
              <p className="text-[0.92rem] leading-relaxed text-[#7a5540] mb-6 pl-3.5 border-l-[3px] border-[#e8d0c0] italic">
                {item.description}
              </p>
            )}

            {item.ingredients && item.ingredients.length > 0 ? (
              <ProductDetailTabs
                ingredients={item.ingredients}
                isPizzaOrFriand={isPizza || isFriand}
              />
            ) : (
              <div className="mb-7" />
            )}

            {isDessert && (
              <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-sm text-[#7a5540] leading-relaxed">
                  🍮 <strong>Fait maison</strong> — Nos desserts sont préparés avec soin pour finir votre repas en beauté.
                </p>
              </div>
            )}

            <div className="flex gap-3 items-center pt-6 border-t border-[#ead5c4]/60">
              <AddToCartButton
                item={item}
                className="flex-1 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-[0_7px_20px_rgba(201,79,42,0.32)] hover:shadow-[0_12px_28px_rgba(201,79,42,0.42)] hover:-translate-y-0.5 transition-all bg-gradient-to-br from-primary to-secondary border-0 text-white"
              />
            </div>
          </div>

          {/* ═══ BLOC 3 — Upsell (indépendant, si présent) ═══ */}
          {upsellItems.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden border border-white/75 px-4 sm:px-6 md:px-10 py-6 md:py-7 mt-4"
              style={{
                background: 'rgba(255,252,248,0.7)',
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset, 0 16px 40px -10px rgba(160,80,30,0.18)',
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#b07050] mb-4">
                Ça se marie bien avec…
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                {upsellItems.map((upsell) => (
                  <div
                    key={upsell.id}
                    className="flex-shrink-0 w-36 bg-white/60 border border-[#ead5c4] rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <span className="text-2xl mb-1">{upsell.type === 'drink' ? '🥤' : '🥐'}</span>
                    <p className="font-bold text-[#2d1a0e] text-xs leading-tight mb-1 line-clamp-1">{upsell.name}</p>
                    <p className="text-primary font-bold text-xs mb-2">{upsell.price.toFixed(2)}€</p>
                    <AddToCartButton
                      item={upsell}
                      size="sm"
                      className="w-full text-xs py-1.5 h-auto bg-[#2d1a0e] hover:bg-primary border-none text-white shadow-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ BLOC 4 — Avis clients ═══ */}
          <ProductReviews menuId={item.id} productName={item.name} />

          {/* ═══ BLOC 5 — Footer (indépendant) ═══ */}
          <div className="mt-8 pt-2 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#b07050] mb-1">
              Envie d&apos;autre chose ?
            </p>
            <p className="text-sm text-[#7a5540] mb-4">Retour au menu ou créez votre pizza sur mesure.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/menu">
                <Button variant="primary" size="lg">
                  Voir tout le menu
                </Button>
              </Link>
              {isDessert && (
                <Link href="/menu">
                  <Button variant="secondary" size="lg">
                    Voir les pizzas
                  </Button>
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
