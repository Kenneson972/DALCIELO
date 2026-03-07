import { getSupabase } from '@/lib/supabaseAdmin'
import type { Review, ReviewInput, ReviewStats, ReviewStatus } from '@/types/review'

type ReviewRow = {
  id: string
  menu_id: number
  author_name: string
  rating: number
  comment: string | null
  status: string
  ip_hash: string | null
  created_at: string
}

const VALID_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected']

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    menu_id: row.menu_id,
    author_name: row.author_name,
    rating: row.rating,
    comment: row.comment ?? null,
    status: VALID_STATUSES.includes(row.status as ReviewStatus)
      ? (row.status as ReviewStatus)
      : 'pending',
    created_at: row.created_at,
  }
}

/** Avis approuvés pour un produit (publics). */
export async function getApprovedReviews(menuId: number): Promise<Review[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('menu_id', menuId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map((r) => rowToReview(r as ReviewRow))
}

/** Stats (note moyenne + distribution) pour un produit. */
export async function getReviewStats(menuId: number): Promise<ReviewStats> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('menu_id', menuId)
    .eq('status', 'approved')
  if (error) throw error
  const rows = data ?? []
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0
  for (const r of rows) {
    const rat = r.rating as number
    if (rat >= 1 && rat <= 5) {
      distribution[rat] = (distribution[rat] ?? 0) + 1
      sum += rat
    }
  }
  return {
    total: rows.length,
    average: rows.length > 0 ? Math.round((sum / rows.length) * 10) / 10 : 0,
    distribution: distribution as Record<1 | 2 | 3 | 4 | 5, number>,
  }
}

/** Crée un avis en statut "pending". */
export async function createReview(input: ReviewInput): Promise<Review> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      menu_id: input.menu_id,
      author_name: input.author_name.trim().slice(0, 80),
      rating: input.rating,
      comment: input.comment?.trim().slice(0, 1000) ?? null,
      status: 'pending',
      ip_hash: input.ip_hash ?? null,
    })
    .select()
    .single()
  if (error) throw error
  if (!data) throw new Error('Review not found after insert')
  return rowToReview(data as ReviewRow)
}

/** Lister tous les avis (admin). */
export async function getAllReviews(status?: ReviewStatus): Promise<Review[]> {
  const supabase = getSupabase()
  let query = supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((r) => rowToReview(r as ReviewRow))
}

/** Modérer un avis (admin). */
export async function moderateReview(
  id: string,
  status: 'approved' | 'rejected'
): Promise<Review | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw error
  return data ? rowToReview(data as ReviewRow) : null
}
