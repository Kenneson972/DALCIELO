import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getSupabase } from '@/lib/supabaseAdmin'
import type { OrderItem } from '@/types/order'

export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const { searchParams } = req.nextUrl
  const from = searchParams.get('from') // e.g. '2026-01-01'
  const to = searchParams.get('to')     // e.g. '2026-03-31'

  const supabase = getSupabase()
  let query = supabase
    .from('orders')
    .select('id, created_at, client_name, client_phone, type_service, heure_souhaitee, items, total, status, token, receipt_pdf_url, receipt_category')
    .order('created_at', { ascending: false })

  if (from) query = query.gte('created_at', `${from}T00:00:00.000Z`)
  if (to)   query = query.lte('created_at', `${to}T23:59:59.999Z`)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const rows = data ?? []

  const header = ['id', 'date', 'client_nom', 'client_telephone', 'service', 'heure_souhaitee', 'nb_articles', 'total', 'statut', 'recu_pdf_url', 'categorie']

  const csvLines = [
    header.join(';'),
    ...rows.map((r) => {
      const items = Array.isArray(r.items) ? r.items : []
      const nbArticles = items.reduce((sum: number, i: OrderItem) => sum + (i.quantity ?? 1), 0)
      const service = r.type_service === 'delivery' ? 'Livraison' : 'Click & Collect'
      const date = new Date(r.created_at).toLocaleDateString('fr-FR', {
        timeZone: 'America/Martinique',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
      const cols = [
        r.id.slice(0, 8).toUpperCase(),
        date,
        `"${(r.client_name ?? '').replace(/"/g, '""')}"`,
        r.client_phone ?? '',
        service,
        r.heure_souhaitee ?? '',
        nbArticles,
        Number(r.total).toFixed(2),
        r.status ?? '',
        r.receipt_pdf_url ?? '',
        r.receipt_category ?? '',
      ]
      return cols.join(';')
    }),
  ]

  const csv = csvLines.join('\r\n')
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `commandes_${dateStr}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
