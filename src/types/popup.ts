export type PopupType = 'chef' | 'promo' | 'event' | 'alert'
export type DismissMode = 'once_daily' | 'once_session'

export interface Popup {
  id: string
  type: PopupType
  title: string
  subtitle?: string | null
  message?: string | null
  image_url?: string | null
  cta_label?: string | null
  cta_url?: string | null
  price?: number | null
  expires_at?: string | null   // "YYYY-MM-DD"
  active: boolean
  dismiss_mode: DismissMode
  priority: number
  created_at: string
  updated_at: string
}
