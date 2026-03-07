import type { DashboardStats, Order, OrderStatus } from '@/types/order'

const ORDERS_KEY = 'pdc_orders'
const STOCKS_KEY = 'pdc_stocks'

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const setLocal = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

// ============= COMMANDES =============

export function getAllOrders(): Order[] {
  if (typeof window === 'undefined') return []
  return safeParse<Order[]>(window.localStorage.getItem(ORDERS_KEY), [])
}

export function getOrderById(id: string): Order | null {
  const orders = getAllOrders()
  return orders.find((o) => o.id === id) || null
}

export function getOrderByToken(token: string): Order | null {
  const orders = getAllOrders()
  return orders.find((o) => o.token === token) || null
}

export function getOrdersByStatus(status: OrderStatus | OrderStatus[]): Order[] {
  const orders = getAllOrders()
  const statuses = Array.isArray(status) ? status : [status]
  return orders.filter((o) => statuses.includes(o.status))
}

export function createOrder(order: Order): Order {
  const orders = getAllOrders()
  orders.unshift(order)
  setLocal(ORDERS_KEY, orders)
  return order
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getAllOrders()
  const index = orders.findIndex((o) => o.id === id)
  if (index === -1) return null
  orders[index] = { ...orders[index], ...updates }
  setLocal(ORDERS_KEY, orders)
  return orders[index]
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  additionalData?: Partial<Order>
): Order | null {
  const updates: Partial<Order> = { status, ...additionalData }

  if (status === 'in_preparation' && !additionalData?.preparation_started_at) {
    updates.preparation_started_at = new Date().toISOString()
  }
  if (status === 'ready' && !additionalData?.actual_ready_time) {
    updates.actual_ready_time = new Date().toISOString()
  }
  if (status === 'completed' && !additionalData?.completed_at) {
    updates.completed_at = new Date().toISOString()
  }

  return updateOrder(id, updates)
}

export function deleteOrder(id: string): boolean {
  const orders = getAllOrders()
  const filtered = orders.filter((o) => o.id !== id)
  if (filtered.length === orders.length) return false
  setLocal(ORDERS_KEY, filtered)
  return true
}

// ============= STATISTIQUES =============

export function getDashboardStats(): DashboardStats {
  const orders = getAllOrders()
  const today = new Date().toDateString()

  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).toDateString() === today
  )

  const paidOrders = todayOrders.filter((o) =>
    ['paid', 'in_preparation', 'ready', 'in_delivery', 'completed'].includes(
      o.status
    )
  )

  const activeOrders = orders.filter((o) =>
    ['paid', 'in_preparation', 'ready', 'in_delivery'].includes(o.status)
  )

  const today_revenue = paidOrders.reduce((sum, o) => sum + o.total, 0)

  const completedWithTimes = paidOrders.filter(
    (o) => o.preparation_started_at && o.actual_ready_time
  )

  const avg_preparation_time =
    completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, o) => {
          const start = new Date(o.preparation_started_at!).getTime()
          const end = new Date(o.actual_ready_time!).getTime()
          return sum + (end - start) / 1000 / 60
        }, 0) / completedWithTimes.length
      : 0

  const totalToday = todayOrders.length
  const validated = todayOrders.filter((o) => o.status !== 'refused').length
  const validation_rate = totalToday > 0 ? (validated / totalToday) * 100 : 100

  const pizzaCount: Record<string, number> = {}
  paidOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (
        ['Pizzas', 'Classique', 'Du Chef'].includes(item.category)
      ) {
        pizzaCount[item.name] = (pizzaCount[item.name] || 0) + item.quantity
      }
    })
  })

  const top_pizzas = Object.entries(pizzaCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return {
    today_revenue,
    today_orders: paidOrders.length,
    active_orders: activeOrders.length,
    avg_preparation_time: Math.round(avg_preparation_time),
    validation_rate: Math.round(validation_rate),
    top_pizzas,
  }
}

// ============= STOCKS =============

export interface Stock {
  item_id: string
  name: string
  category: string
  quantity: number
  min_threshold: number
  unit: string
}

export function getAllStocks(): Stock[] {
  if (typeof window === 'undefined') return []
  const data = window.localStorage.getItem(STOCKS_KEY)
  if (!data) return getDefaultStocks()
  try {
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed)) return parsed as Stock[]
    // Migration from legacy object-based stocks to array
    if (parsed && typeof parsed === 'object') {
      const migrated = Object.entries(parsed).map(([key, value]) => ({
        item_id: String(key),
        name: String(key),
        category: 'Stocks',
        quantity: typeof value === 'number' ? value : 0,
        min_threshold: 5,
        unit: 'unité',
      }))
      setLocal(STOCKS_KEY, migrated)
      return migrated
    }
    return getDefaultStocks()
  } catch {
    return getDefaultStocks()
  }
}

export function getDefaultStocks(): Stock[] {
  return [
    { item_id: 'stock-margherita', name: 'Margherita', category: 'Pizzas', quantity: 20, min_threshold: 5, unit: 'unité' },
    { item_id: 'stock-regina', name: 'Regina', category: 'Pizzas', quantity: 20, min_threshold: 5, unit: 'unité' },
    { item_id: 'stock-4fromages', name: '4 Fromages', category: 'Pizzas', quantity: 15, min_threshold: 5, unit: 'unité' },
    { item_id: 'stock-calzone', name: 'Calzone', category: 'Pizzas', quantity: 12, min_threshold: 3, unit: 'unité' },
    { item_id: 'stock-carnivore', name: 'Friand Carnivore', category: 'Friands', quantity: 15, min_threshold: 5, unit: 'unité' },
    { item_id: 'stock-vegetarien', name: 'Friand Végétarien', category: 'Friands', quantity: 12, min_threshold: 4, unit: 'unité' },
    { item_id: 'stock-super-carnivore', name: 'Friand Super Carnivore', category: 'Friands', quantity: 10, min_threshold: 3, unit: 'unité' },
  ]
}

export function updateStock(item_id: string, quantity: number): Stock | null {
  const stocks = getAllStocks()
  const index = stocks.findIndex((s) => s.item_id === item_id)
  if (index === -1) return null
  stocks[index].quantity = Math.max(0, quantity)
  setLocal(STOCKS_KEY, stocks)
  return stocks[index]
}

export function adjustStock(item_id: string, adjustment: number): Stock | null {
  const stocks = getAllStocks()
  const stock = stocks.find((s) => s.item_id === item_id)
  if (!stock) return null
  return updateStock(item_id, stock.quantity + adjustment)
}

export interface StockAlert {
  level: 'critical' | 'warning'
  item: string
  message: string
  quantity: number
  threshold: number
}

export function getStockAlerts(): StockAlert[] {
  const stocks = getAllStocks()
  const alerts: StockAlert[] = []
  stocks.forEach((stock) => {
    if (stock.quantity <= stock.min_threshold) {
      alerts.push({
        level: 'critical',
        item: stock.name,
        message: `Stock critique : ${stock.quantity} ${stock.unit} restant(s)`,
        quantity: stock.quantity,
        threshold: stock.min_threshold,
      })
    } else if (stock.quantity <= stock.min_threshold * 2) {
      alerts.push({
        level: 'warning',
        item: stock.name,
        message: `Stock faible : ${stock.quantity} ${stock.unit}`,
        quantity: stock.quantity,
        threshold: stock.min_threshold,
      })
    }
  })
  return alerts.sort((a, b) => {
    if (a.level === 'critical' && b.level === 'warning') return -1
    if (a.level === 'warning' && b.level === 'critical') return 1
    return 0
  })
}

export function exportOrdersToCSV(orders: Order[]): void {
  if (typeof window === 'undefined') return

  const headers = ['Date', 'Heure', 'Client', 'Telephone', 'Type', 'Total', 'Statut', 'Articles']

  const rows = orders.map((order) => [
    new Date(order.created_at).toLocaleDateString('fr-FR'),
    new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    order.client_name,
    order.client_phone,
    order.type_service === 'click_collect' ? 'Click & Collect' : 'Livraison',
    `${order.total.toFixed(2)}EUR`,
    order.status,
    order.items.map((i) => `${i.quantity}x ${i.name}`).join(' | '),
  ])

  const escapeCSV = (cell: string) => `"${cell.replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map((cell) => escapeCSV(String(cell))).join(',')).join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export const createLocalOrderId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `order_${Date.now()}`
}

export const createOrderToken = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `token_${Date.now()}`
}
