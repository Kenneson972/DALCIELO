import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category?: string
  customizations?: string[]
  image?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number, customizations?: string[]) => void
  updateQuantity: (id: number, quantity: number, customizations?: string[]) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        const currentItems = get().items
        const custKey = (c: string[] | undefined) => (c && c.length ? c.slice().sort().join('|') : '')
        const newKey = custKey(newItem.customizations)
        const existingItem = currentItems.find(
          (item) =>
            item.id === newItem.id && custKey(item.customizations) === newKey
        )

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === newItem.id && custKey(item.customizations) === newKey
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({ items: [...currentItems, { ...newItem, quantity: 1 }] })
        }
      },

      removeItem: (id, customizations) => {
        const custKey = (c: string[] | undefined) => (c && c.length ? c.slice().sort().join('|') : '')
        const key = custKey(customizations)
        set({
          items: get().items.filter(
            (item) => !(item.id === id && custKey(item.customizations) === key)
          ),
        })
      },

      updateQuantity: (id, quantity, customizations) => {
        if (quantity <= 0) {
          get().removeItem(id, customizations)
          return
        }
        const custKey = (c: string[] | undefined) => (c && c.length ? c.slice().sort().join('|') : '')
        const key = custKey(customizations)
        set({
          items: get().items.map((item) =>
            item.id === id && custKey(item.customizations) === key ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'pizza-cart-storage',
    }
  )
)
