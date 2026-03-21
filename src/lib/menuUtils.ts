import { menuData } from '@/data/menuData'
import { generateSlug } from './utils'

export type MenuItemType = 'pizza' | 'friand' | 'drink' | 'dessert'

export interface MenuItem {
  id: number
  name: string
  price: number
  category?: string
  ingredients?: string[]
  description?: string
  image?: string
  popular?: boolean
  vegetarian?: boolean
  badgeLabels?: string[]
  type: MenuItemType
  size?: string
  /** Si true, la pizza propose un choix de sauce après cuisson (Ketchup, Barbecue, etc.) */
  sauceAuChoix?: boolean
  /** Choix obligatoire d'ingrédients parmi une liste (ex. : 3 viandes pour le Suprême) */
  varianteChoix?: { count: number; options: string[] }
  /** Date de fin de validité (Pizza du Chef), format YYYY-MM-DD */
  chef_valid_until?: string | null
}

/**
 * Get all menu items with their types
 */
export function getAllMenuItems(): MenuItem[] {
  return [
    ...menuData.pizzas.map(p => ({ ...p, type: 'pizza' as MenuItemType })),
    ...menuData.friands.map(f => ({ ...f, type: 'friand' as MenuItemType })),
    ...menuData.drinks.map(d => ({ ...d, type: 'drink' as MenuItemType })),
    ...menuData.desserts.map(d => ({ ...d, type: 'dessert' as MenuItemType })),
  ]
}

/**
 * Get a menu item by slug
 */
export function getMenuItemBySlug(slug: string): MenuItem | null {
  const allItems = getAllMenuItems()
  return allItems.find(item => generateSlug(item.name) === slug) || null
}

/**
 * Get all slugs for static generation
 */
export function getAllSlugs(): string[] {
  return getAllMenuItems().map(item => generateSlug(item.name))
}
