import { getSupabase } from '@/lib/supabaseAdmin'

export interface Stock {
  id: number
  item_id: string
  name: string
  category: string
  quantity: number
  min_threshold: number
  unit: string
  created_at: string
  updated_at: string
}

type StockRow = {
  id: number
  item_id: string
  name: string
  category: string
  quantity: number
  min_threshold: number
  unit: string
  created_at: string
  updated_at: string
}

function rowToStock(row: StockRow): Stock {
  return {
    id: row.id,
    item_id: row.item_id,
    name: row.name,
    category: row.category,
    quantity: Number(row.quantity),
    min_threshold: Number(row.min_threshold),
    unit: row.unit ?? 'unité',
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  }
}

export async function getStocks(): Promise<Stock[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToStock)
}

export async function getStockByItemId(item_id: string): Promise<Stock | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('stocks').select('*').eq('item_id', item_id).single()
  if (error || !data) return null
  return rowToStock(data)
}

export interface StockInput {
  item_id: string
  name: string
  category: string
  quantity?: number
  min_threshold?: number
  unit?: string
}

export async function createStock(input: StockInput): Promise<Stock> {
  const supabase = getSupabase()
  const quantity = input.quantity ?? 20
  const min_threshold = input.min_threshold ?? 5
  const unit = input.unit ?? 'unité'

  const { data, error } = await supabase
    .from('stocks')
    .insert({
      item_id: input.item_id,
      name: input.name,
      category: input.category,
      quantity,
      min_threshold,
      unit,
    })
    .select()
    .single()
  if (error) throw error
  if (!data) throw new Error('Stock not found after insert')
  return rowToStock(data)
}

export async function updateStock(
  item_id: string,
  updates: { quantity?: number; min_threshold?: number; name?: string; category?: string; unit?: string }
): Promise<Stock | null> {
  const supabase = getSupabase()
  const patch: Record<string, unknown> = {}
  if (updates.quantity !== undefined) patch.quantity = Math.max(0, updates.quantity)
  if (updates.min_threshold !== undefined) patch.min_threshold = Math.max(0, updates.min_threshold)
  if (updates.name !== undefined) patch.name = updates.name
  if (updates.category !== undefined) patch.category = updates.category
  if (updates.unit !== undefined) patch.unit = updates.unit
  if (Object.keys(patch).length === 0) return getStockByItemId(item_id)

  const { data, error } = await supabase
    .from('stocks')
    .update(patch)
    .eq('item_id', item_id)
    .select()
    .single()
  if (error) throw error
  return data ? rowToStock(data) : null
}

export async function adjustStock(item_id: string, delta: number): Promise<Stock | null> {
  const current = await getStockByItemId(item_id)
  if (!current) return null
  return updateStock(item_id, { quantity: Math.max(0, current.quantity + delta) })
}

export async function countStocks(): Promise<number> {
  const supabase = getSupabase()
  const { count, error } = await supabase.from('stocks').select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}
