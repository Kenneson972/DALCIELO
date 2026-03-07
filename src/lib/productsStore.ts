import { getSupabase } from '@/lib/supabaseAdmin'
import { menuData } from '@/data/menuData'
import { generateSlug } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: number
  menu_id: number
  slug: string
  type: 'pizza' | 'friand' | 'drink' | 'dessert'
  name: string
  category: string | null
  price: number
  description: string | null
  ingredients: string[] | null
  image_url: string | null
  /** Galerie d’images (détail produit). image_url = principale pour la liste. */
  image_urls?: string[] | null
  /** Image réservée au slider homepage (ex. pizza détourée). Optionnel. */
  slider_image_url?: string | null
  /** Afficher cette pizza dans le slider de la page d'accueil (pizzas + Pizza du Chef). */
  show_in_slider?: boolean
  size: string | null
  available: boolean
  popular: boolean
  vegetarian: boolean
  premium: boolean
  /** Pizzas uniquement : choix de sauce après cuisson (Ketchup, Barbecue, etc.). Présent après migration 006. */
  sauce_au_choix?: boolean
  is_chef_special: boolean
  chef_valid_until: string | null // ISO date "YYYY-MM-DD"
  created_at: string
  updated_at: string
}

export type ProductUpdate = Partial<Omit<Product, 'id' | 'menu_id' | 'created_at' | 'updated_at'>>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Construit la liste complète des produits à partir de menuData (pour le seed). */
export function buildProductsFromMenu(): Omit<Product, 'id' | 'created_at' | 'updated_at'>[] {
  const items: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = []

  for (const p of menuData.pizzas) {
    items.push({
      menu_id: p.id,
      slug: generateSlug(p.name),
      type: 'pizza',
      name: p.name,
      category: p.category ?? null,
      price: p.price,
      description: (p as any).description ?? null,
      ingredients: (p as any).ingredients ?? null,
      image_url: (p as any).image ?? null,
      size: null,
      available: true,
      popular: (p as any).popular ?? false,
      vegetarian: (p as any).vegetarian ?? false,
      premium: (p as any).premium ?? false,
      sauce_au_choix: (p as any).sauceAuChoix ?? false,
      image_urls: [],
      slider_image_url: null,
      show_in_slider: true,
      is_chef_special: p.category === 'Du Chef',
      chef_valid_until: null,
    })
  }

  for (const f of menuData.friands) {
    items.push({
      menu_id: f.id,
      slug: generateSlug(f.name + '-friand'),
      type: 'friand',
      name: f.name,
      category: 'Friands',
      price: f.price,
      description: (f as any).description ?? null,
      ingredients: (f as any).ingredients ?? null,
      image_url: (f as any).image ?? null,
      size: null,
      available: true,
      popular: (f as any).popular ?? false,
      vegetarian: (f as any).vegetarian ?? false,
      premium: false,
      sauce_au_choix: false,
      image_urls: [],
      slider_image_url: null,
      is_chef_special: false,
      chef_valid_until: null,
    })
  }

  for (const d of menuData.drinks) {
    items.push({
      menu_id: d.id,
      slug: generateSlug(d.name + '-boisson'),
      type: 'drink',
      name: d.name,
      category: 'Boissons',
      price: d.price,
      description: null,
      ingredients: null,
      image_url: null,
      size: (d as any).size ?? null,
      available: true,
      popular: false,
      vegetarian: false,
      premium: false,
      sauce_au_choix: false,
      image_urls: [],
      slider_image_url: null,
      is_chef_special: false,
      chef_valid_until: null,
    })
  }

  for (const d of menuData.desserts) {
    items.push({
      menu_id: d.id,
      slug: generateSlug(d.name + '-dessert'),
      type: 'dessert',
      name: d.name,
      category: 'Desserts',
      price: d.price,
      description: d.description ?? null,
      ingredients: null,
      image_url: d.image ?? null,
      size: null,
      available: true,
      popular: false,
      vegetarian: false,
      premium: false,
      sauce_au_choix: false,
      image_urls: [],
      slider_image_url: null,
      is_chef_special: false,
      chef_valid_until: null,
    })
  }

  return items
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/** Liste tous les produits. */
export async function getProducts(): Promise<Product[]> {
  const db = getSupabase()
  const { data, error } = await db
    .from('products')
    .select('*')
    .order('type')
    .order('category')
    .order('menu_id')

  if (error) throw new Error(error.message)
  return (data ?? []) as Product[]
}

/** Récupère la Pizza du Chef (is_chef_special = true). */
export async function getChefProduct(): Promise<Product | null> {
  const db = getSupabase()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('is_chef_special', true)
    .eq('available', true)
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data as Product | null
}

/** Récupère un produit par slug (pour les pages publiques). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = getSupabase()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Product
}

export type ProductCreate = {
  type: 'pizza' | 'friand' | 'drink' | 'dessert'
  name: string
  price: number
  category?: string | null
  description?: string | null
  ingredients?: string[] | null
  image_url?: string | null
  image_urls?: string[] | null
  slider_image_url?: string | null
  size?: string | null
  available?: boolean
  popular?: boolean
  vegetarian?: boolean
  premium?: boolean
  sauce_au_choix?: boolean
  is_chef_special?: boolean
}

/** Crée un nouveau produit. menu_id et slug sont auto-générés. */
export async function createProduct(data: ProductCreate): Promise<Product> {
  const db = getSupabase()

  // Génère un menu_id unique (max + 1 dans la table)
  const { data: maxRow } = await db
    .from('products')
    .select('menu_id')
    .order('menu_id', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextMenuId = ((maxRow as { menu_id: number } | null)?.menu_id ?? 0) + 1

  // Génère un slug unique
  let baseSlug = generateSlug(data.name)
  if (data.type === 'drink') baseSlug = generateSlug(data.name + '-boisson')
  else if (data.type === 'friand') baseSlug = generateSlug(data.name + '-friand')
  else if (data.type === 'dessert') baseSlug = generateSlug(data.name + '-dessert')

  const { data: slugConflict } = await db
    .from('products')
    .select('slug')
    .like('slug', `${baseSlug}%`)

  const existingSlugs = new Set((slugConflict ?? []).map((r: { slug: string }) => r.slug))
  let slug = baseSlug
  let i = 2
  while (existingSlugs.has(slug)) { slug = `${baseSlug}-${i++}` }

  const row = {
    menu_id:          nextMenuId,
    slug,
    type:             data.type,
    name:             data.name,
    category:         data.category ?? null,
    price:            data.price,
    description:      data.description ?? null,
    ingredients:      data.ingredients ?? null,
    image_url:        data.image_url ?? null,
    image_urls:       data.image_urls ?? [],
    slider_image_url: data.slider_image_url ?? null,
    show_in_slider:   data.show_in_slider ?? true,
    size:             data.size ?? null,
    available:        data.available ?? true,
    popular:          data.popular ?? false,
    vegetarian:       data.vegetarian ?? false,
    premium:          data.premium ?? false,
    sauce_au_choix:   data.sauce_au_choix ?? false,
    is_chef_special:  data.is_chef_special ?? false,
    chef_valid_until: null,
  }

  const { data: created, error } = await db
    .from('products')
    .insert(row)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return created as Product
}

/** Met à jour un produit. Retourne le produit mis à jour. */
export async function updateProduct(id: number, patch: ProductUpdate): Promise<Product> {
  const db = getSupabase()
  const { data, error } = await db
    .from('products')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Product
}

/** Seed depuis menuData — upsert sur menu_id (idempotent). */
export async function seedProducts(): Promise<{ inserted: number; updated: number }> {
  const db = getSupabase()
  const items = buildProductsFromMenu()

  const { data, error } = await db
    .from('products')
    .upsert(items, { onConflict: 'menu_id' })
    .select()

  if (error) throw new Error(error.message)

  const count = (data ?? []).length
  return { inserted: count, updated: 0 }
}
