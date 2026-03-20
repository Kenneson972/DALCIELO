import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getQueueSettings, upsertQueueSettings } from '@/lib/queueSettingsStore'

export const dynamic = 'force-dynamic'

const QueueSettingsPatchSchema = z.object({
  ovenAvailable: z.boolean().optional(),
  mode: z.enum(['auto', 'manual']).optional(),
  manualEstimatedMinutes: z.number().int().min(5).max(180).nullable().optional(),
})

export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const settings = await getQueueSettings()
    return NextResponse.json({ settings })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[GET /api/admin/queue-settings] Error:', message)
    return NextResponse.json({ error: 'Failed to fetch queue settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const parsed = QueueSettingsPatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const settings = await upsertQueueSettings(parsed.data)
    return NextResponse.json({ settings })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[PATCH /api/admin/queue-settings] Error:', message)
    return NextResponse.json({ error: 'Failed to update queue settings' }, { status: 500 })
  }
}
