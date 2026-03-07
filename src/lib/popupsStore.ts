import { getSupabase } from '@/lib/supabaseAdmin'
import type { Popup } from '@/types/popup'

/** Popup actif avec la priorité la plus basse (0 = urgence max). Public. */
export async function getActivePopup(): Promise<Popup | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as Popup | null
}

/** Tous les popups (admin). */
export async function getAllPopups(): Promise<Popup[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('popups')
    .select('*')
    .order('priority', { ascending: true })
  if (error) throw error
  return (data ?? []) as Popup[]
}

/** Crée un popup (admin). */
export async function createPopup(
  input: Omit<Popup, 'id' | 'created_at' | 'updated_at'>
): Promise<Popup> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('popups')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Popup
}

/** Met à jour un popup (admin). */
export async function updatePopup(
  id: string,
  patch: Partial<Omit<Popup, 'id' | 'created_at' | 'updated_at'>>
): Promise<Popup> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('popups')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Popup
}

/** Supprime un popup (admin). */
export async function deletePopup(id: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('popups').delete().eq('id', id)
  if (error) throw error
}
