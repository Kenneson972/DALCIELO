import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getHomepageSettings, upsertHomepageSettings } from '@/lib/homepageSettingsStore'

const PatchSchema = z.object({
  sliderEnabled: z.boolean().optional(),
  dessertsEnabled: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const settings = await getHomepageSettings()
    return NextResponse.json({ settings })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[GET /api/admin/homepage-settings] Error:', message)
    return NextResponse.json({ error: 'Failed to fetch homepage settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const settings = await upsertHomepageSettings(parsed.data)
    return NextResponse.json({ settings })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[PATCH /api/admin/homepage-settings] Error:', message)
    return NextResponse.json({ error: 'Failed to update homepage settings' }, { status: 500 })
  }
}
