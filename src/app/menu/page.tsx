import { getProducts } from '@/lib/productsStore'
import { menuData } from '@/data/menuData'
import { generateSlug } from '@/lib/utils'
import { MenuPageClient, type MenuPageItem } from '@/components/menu/MenuPageClient'
import { getHomepageSettings } from '@/lib/homepageSettingsStore'
import { InlineJsonLd } from '@/components/seo/InlineJsonLd'
import { absoluteUrl, getBaseUrl } from '@/lib/seo'

export const revalidate = 0 // Toujours à jour (toggle Pizza du Chef, stocks, etc.)

/** IDs des pizzas avec sauce au choix (Variante 2 dans import_articles_source.csv). Utilisé quand Supabase n'a pas sauce_au_choix. */
const PIZZA_IDS_SAUCE_AU_CHOIX = new Set([201, 202, 203, 204, 205, 206, 207, 208, 210, 211, 213, 214, 215])

/** Lookup statique varianteChoix + extraBases par menu_id (non stocké dans Supabase). */
const PIZZA_EXTRA_OPTIONS: Record<number, { varianteChoix?: { count: number; options: string[] }; extraBases?: { id: number; name: string; price: number }[] }> = Object.fromEntries(
  [...menuData.pizzas, ...menuData.friands]
    .filter((p: any) => p.varianteChoix || p.extraBases)
    .map((p: any) => [p.id, { varianteChoix: p.varianteChoix, extraBases: p.extraBases }])
)

/** Construit la liste depuis menuData (fallback statique) */
function itemsFromStaticData(): MenuPageItem[] {
  return [
    ...menuData.pizzas.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      type: 'Pizza',
      category: (p as any).category,
      ingredients: (p as any).ingredients,
      description: (p as any).description,
      image: (p as any).image,
      popular: (p as any).popular,
      vegetarian: (p as any).vegetarian,
      badgeLabel: (p as any).badgeLabel,
      sauceAuChoix: (p as any).sauceAuChoix ?? false,
      slug: generateSlug(p.name),
      varianteChoix: (p as any).varianteChoix,
      extraBases: (p as any).extraBases,
    })),
    ...menuData.friands.map(f => ({
      id: f.id,
      name: f.name,
      price: f.price,
      type: 'Friand',
      category: 'Friands',
      ingredients: (f as any).ingredients,
      description: (f as any).description,
      image: (f as any).image,
      popular: (f as any).popular,
      vegetarian: (f as any).vegetarian,
      slug: generateSlug(f.name + '-friand'),
      varianteChoix: (f as any).varianteChoix,
    })),
    ...menuData.drinks.map(d => ({
      id: d.id,
      name: d.name,
      price: d.price,
      type: 'Drink',
      category: 'Boissons',
      description: (d as any).size,
      slug: generateSlug(d.name + '-boisson'),
    })),
    ...menuData.desserts.map(d => ({
      id: d.id,
      name: d.name,
      price: d.price,
      type: 'Dessert',
      category: 'Desserts',
      description: d.description,
      image: d.image,
      slug: generateSlug(d.name + '-dessert'),
    })),
  ]
}

export default async function MenuPage() {
  let items: MenuPageItem[] = []

  // Récupère le flag desserts (avec fallback silencieux)
  let dessertsEnabled = false
  try {
    const settings = await getHomepageSettings()
    dessertsEnabled = settings.dessertsEnabled
  } catch {
    // Fallback : desserts masqués si settings indisponibles
  }

  try {
    const products = await getProducts()
    if (products.length > 0) {
      items = products
        .filter(p => p.available)
        .filter(p => p.type !== 'dessert' || dessertsEnabled)
        .map(p => {
          const isPizza = p.type === 'pizza'
          const isDessert = p.type === 'dessert'
          const sauceAuChoix =
            (p as any).sauce_au_choix ??
            (isPizza && PIZZA_IDS_SAUCE_AU_CHOIX.has(p.menu_id))
          return {
            id: p.menu_id,
            name: p.name,
            price: p.price,
            type: isPizza ? 'Pizza' : p.type === 'friand' ? 'Friand' : isDessert ? 'Dessert' : 'Drink',
            category: p.category ?? undefined,
            ingredients: p.ingredients ?? undefined,
            description: p.description ?? undefined,
            image: p.image_url ?? undefined,
            popular: p.popular,
            vegetarian: p.vegetarian,
            badgeLabel: p.badge_label ?? undefined,
            sauceAuChoix: !!sauceAuChoix,
            slug: p.slug,
            varianteChoix: PIZZA_EXTRA_OPTIONS[p.menu_id]?.varianteChoix,
            extraBases: PIZZA_EXTRA_OPTIONS[p.menu_id]?.extraBases,
          }
        })
    } else {
      items = itemsFromStaticData().filter(i => i.type !== 'Dessert' || dessertsEnabled)
    }
  } catch {
    // Supabase indisponible ou table non encore seedée → fallback statique
    items = itemsFromStaticData().filter(i => i.type !== 'Dessert' || dessertsEnabled)
  }

  const BASE_URL = getBaseUrl()
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Menu', item: absoluteUrl('/menu') },
    ],
  }
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Menu Pizza Dal Cielo',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: items.length,
    itemListElement: items.slice(0, 30).map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      url: absoluteUrl(`/menu/${it.slug}`),
    })),
  }

  return (
    <>
      <InlineJsonLd schema={[breadcrumbSchema, itemListSchema]} />
      <MenuPageClient items={items} />
    </>
  )
}
