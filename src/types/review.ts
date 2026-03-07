export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  menu_id: number
  author_name: string
  rating: number        // 1–5
  comment: string | null
  status: ReviewStatus
  created_at: string
}

export interface ReviewInput {
  menu_id: number
  author_name: string
  rating: number
  comment?: string
  ip_hash?: string
}

export interface ReviewStats {
  total: number
  average: number       // 0 si aucun avis
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}
