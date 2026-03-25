import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'
import { getSupabase } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

// Normalise une chaîne pour la comparaison fuzzy (minuscules, sans accents, sans espaces)
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '')
}

// Mappe les noms de colonnes CSV vers les champs DB
const COLUMN_MAP: Record<string, string> = {
  // prenom
  prenom: 'prenom',
  firstname: 'prenom',
  givenname: 'prenom',
  // nom
  nom: 'nom',
  name: 'nom',
  lastname: 'nom',
  surname: 'nom',
  familyname: 'nom',
  // phone
  telephone: 'phone',
  phone: 'phone',
  tel: 'phone',
  mobile: 'phone',
  portable: 'phone',
  // pizza
  pizzahabituelle: 'pizza_habituelle',
  pizza: 'pizza_habituelle',
  favori: 'pizza_habituelle',
  pizzafavorite: 'pizza_habituelle',
  // points
  points: 'fidelity_points',
  fidelite: 'fidelity_points',
  fidelity: 'fidelity_points',
  pointsfidelite: 'fidelity_points',
  pointsfidelity: 'fidelity_points',
  // notes
  notes: 'notes',
  commentaire: 'notes',
  commentaires: 'notes',
  remarque: 'notes',
  info: 'notes',
  // date (ignorée à l'import)
  dateajout: '_ignore',
  date: '_ignore',
  createdat: '_ignore',
}

function detectSeparator(headerLine: string): string {
  const counts = { ';': 0, ',': 0, '\t': 0 }
  for (const sep of [';', ',', '\t'] as const) {
    counts[sep] = headerLine.split(sep).length
  }
  if (counts[';'] >= counts[','] && counts[';'] >= counts['\t']) return ';'
  if (counts['\t'] >= counts[',']) return '\t'
  return ','
}

function stripQuotes(s: string): string {
  s = s.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/""/g, '"')
  }
  return s
}

export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError

  let text: string
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Fichier CSV manquant.' }, { status: 400 })
    }
    text = await (file as File).text()
  } catch {
    return NextResponse.json({ error: 'Impossible de lire le fichier.' }, { status: 400 })
  }

  // Retirer le BOM UTF-8
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)

  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '')
  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV vide ou sans données.' }, { status: 400 })
  }

  const headerLine = lines[0]
  const sep = detectSeparator(headerLine)
  const headers = headerLine.split(sep).map(h => normalize(stripQuotes(h)))

  // Construire le mapping index → champ DB
  const colMap: Record<number, string> = {}
  headers.forEach((h, i) => {
    const field = COLUMN_MAP[h]
    if (field && field !== '_ignore') colMap[i] = field
  })

  const imported: number[] = []
  const updated: number[] = []
  const errors: { line: number; reason: string }[] = []

  const supabase = getSupabase()

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1
    const cols = lines[i].split(sep).map(stripQuotes)

    const row: Record<string, string | number | null> = {}
    for (const [idxStr, field] of Object.entries(colMap)) {
      const idx = Number(idxStr)
      const val = cols[idx]?.trim() ?? ''
      if (field === 'fidelity_points') {
        row[field] = parseInt(val, 10) || 0
      } else {
        row[field] = val || null
      }
    }

    // phone obligatoire
    if (!row['phone'] || String(row['phone']).length < 6) {
      errors.push({ line: lineNum, reason: 'Téléphone manquant ou invalide' })
      continue
    }
    // nom et prenom obligatoires
    if (!row['nom']) {
      errors.push({ line: lineNum, reason: 'Nom manquant' })
      continue
    }
    if (!row['prenom']) {
      errors.push({ line: lineNum, reason: 'Prénom manquant' })
      continue
    }

    // Upsert sur phone
    const { data, error } = await supabase
      .from('clients')
      .upsert(
        {
          nom: String(row['nom']),
          prenom: String(row['prenom']),
          phone: String(row['phone']),
          pizza_habituelle: row['pizza_habituelle'] ? String(row['pizza_habituelle']) : null,
          fidelity_points: Number(row['fidelity_points'] ?? 0),
          notes: row['notes'] ? String(row['notes']) : null,
        },
        { onConflict: 'phone', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (error) {
      errors.push({ line: lineNum, reason: error.message })
    } else if (data) {
      // On ne peut pas distinguer insert/update facilement avec upsert
      // On vérifie si le client existait avant via select séparé (simplifié : on compte les updates via le created_at)
      imported.push(lineNum)
    }
  }

  return NextResponse.json({
    imported: imported.length,
    skipped: errors.length,
    errors,
  })
}
