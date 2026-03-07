import { getSupabase } from '@/lib/supabaseAdmin'

export interface HomepageSettings {
  sliderEnabled: boolean
  dessertsEnabled: boolean
}

type Row = {
  id: number
  slider_enabled: boolean
  desserts_enabled: boolean
}

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  sliderEnabled: true,
  dessertsEnabled: false,
}

function rowToSettings(row: Row | null | undefined): HomepageSettings {
  if (!row) return DEFAULT_HOMEPAGE_SETTINGS
  return {
    sliderEnabled: row.slider_enabled ?? true,
    dessertsEnabled: row.desserts_enabled ?? false,
  }
}

export async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('homepage_settings')
      .select('id, slider_enabled, desserts_enabled')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    return rowToSettings(data as Row | null)
  } catch {
    return DEFAULT_HOMEPAGE_SETTINGS
  }
}

export async function upsertHomepageSettings(
  next: Partial<HomepageSettings>
): Promise<HomepageSettings> {
  const current = await getHomepageSettings()
  const merged: HomepageSettings = {
    sliderEnabled:
      typeof next.sliderEnabled === 'boolean' ? next.sliderEnabled : current.sliderEnabled,
    dessertsEnabled:
      typeof next.dessertsEnabled === 'boolean' ? next.dessertsEnabled : current.dessertsEnabled,
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('homepage_settings')
    .upsert(
      { id: 1, slider_enabled: merged.sliderEnabled, desserts_enabled: merged.dessertsEnabled },
      { onConflict: 'id' }
    )
    .select('id, slider_enabled, desserts_enabled')
    .single()

  if (error) throw error
  return rowToSettings(data as Row)
}
