import { getSupabase } from '@/lib/supabaseAdmin'

export type QueueMode = 'auto' | 'manual'

export interface QueueSettings {
  ovenAvailable: boolean
  mode: QueueMode
  manualEstimatedMinutes: number | null
}

type QueueSettingsRow = {
  id: number
  oven_available: boolean
  mode: QueueMode
  manual_estimated_minutes: number | null
}

export const DEFAULT_QUEUE_SETTINGS: QueueSettings = {
  ovenAvailable: true,
  mode: 'auto',
  manualEstimatedMinutes: null,
}

function rowToQueueSettings(row: QueueSettingsRow | null | undefined): QueueSettings {
  if (!row) return DEFAULT_QUEUE_SETTINGS
  return {
    ovenAvailable: row.oven_available ?? true,
    mode: row.mode === 'manual' ? 'manual' : 'auto',
    manualEstimatedMinutes:
      typeof row.manual_estimated_minutes === 'number' ? row.manual_estimated_minutes : null,
  }
}

export async function getQueueSettings(): Promise<QueueSettings> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('queue_settings')
    .select('id, oven_available, mode, manual_estimated_minutes')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  return rowToQueueSettings(data as QueueSettingsRow | null)
}

export async function upsertQueueSettings(
  next: Partial<QueueSettings>
): Promise<QueueSettings> {
  const current = await getQueueSettings()
  const merged: QueueSettings = {
    ovenAvailable:
      typeof next.ovenAvailable === 'boolean' ? next.ovenAvailable : current.ovenAvailable,
    mode: next.mode === 'manual' ? 'manual' : next.mode === 'auto' ? 'auto' : current.mode,
    manualEstimatedMinutes:
      typeof next.manualEstimatedMinutes === 'number'
        ? Math.max(5, Math.min(180, Math.round(next.manualEstimatedMinutes)))
        : next.manualEstimatedMinutes === null
          ? null
          : current.manualEstimatedMinutes,
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('queue_settings')
    .upsert(
      {
        id: 1,
        oven_available: merged.ovenAvailable,
        mode: merged.mode,
        manual_estimated_minutes: merged.manualEstimatedMinutes,
      },
      { onConflict: 'id' }
    )
    .select('id, oven_available, mode, manual_estimated_minutes')
    .single()

  if (error) throw error
  return rowToQueueSettings(data as QueueSettingsRow)
}
