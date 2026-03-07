import { NextResponse } from 'next/server'
import { getActivePopup } from '@/lib/popupsStore'

export async function GET() {
  try {
    const popup = await getActivePopup()
    const res = NextResponse.json({ popup })
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
  } catch {
    const res = NextResponse.json({ popup: null })
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
  }
}
