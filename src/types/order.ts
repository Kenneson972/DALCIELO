export type OrderStatus =
  | 'pending_validation'
  | 'waiting_payment'
  | 'paid'
  | 'in_preparation'
  | 'ready'
  | 'in_delivery'
  | 'completed'
  | 'cancelled'
  | 'refused'

export type OrderItem = {
  id: number | string
  name: string
  price: number
  quantity: number
  category: string
  customizations?: string[]
  image?: string
}

export type Order = {
  id: string
  token: string
  created_at: string
  client_name: string
  client_phone: string
  client_email?: string
  type_service: 'click_collect' | 'delivery'
  heure_souhaitee: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  estimated_ready_time?: string
  actual_ready_time?: string
  preparation_started_at?: string
  completed_at?: string
  notes?: string
  delivery_address?: string
  refusal_reason?: string
  payment_link?: string
  /** URL du reçu PDF généré par n8n (stocké dans Supabase Storage) */
  receipt_pdf_url?: string
  /** Catégorie de classement du bon de commande (admin) */
  receipt_category?: string
}

export interface DashboardStats {
  today_revenue: number
  today_orders: number
  active_orders: number
  avg_preparation_time: number
  validation_rate: number
  top_pizzas: Array<{ name: string; count: number }>
}
