import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getSupabase } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  const rows = data ?? []
  const header = ['Prénom', 'Nom', 'Téléphone', 'Pizza habituelle', 'Points fidélité', 'Notes', 'Date ajout']

  const csvLines = [
    header.join(';'),
    ...rows.map((r) => {
      const date = new Date(r.created_at).toLocaleDateString('fr-FR', {
        timeZone: 'America/Martinique',
        year: 'numeric', month: '2-digit', day: '2-digit',
      })
      return [
        `"${(r.prenom ?? '').replace(/"/g, '""')}"`,
        `"${(r.nom ?? '').replace(/"/g, '""')}"`,
        r.phone ?? '',
        `"${(r.pizza_habituelle ?? '').replace(/"/g, '""')}"`,
        r.fidelity_points ?? 0,
        `"${(r.notes ?? '').replace(/"/g, '""')}"`,
        date,
      ].join(';')
    }),
  ]

  const BOM = '\uFEFF'
  const csv = BOM + csvLines.join('\r\n')
  const dateStr = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="clients_${dateStr}.csv"`,
    },
  })
}
