import { NextRequest, NextResponse } from 'next/server'
import { getStocks, createStock, updateStock } from '@/lib/stocksStore'
import { menuData } from '@/data/menuData'
import { requireAdminWithRateLimit } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const authError = requireAdminWithRateLimit(req)
  if (authError) return authError
  try {
    const existingStocks = await getStocks()
    const existingIds = new Set(existingStocks.map((s) => s.item_id))

    const menuCategories: Record<string, string> = {}
    for (const p of menuData.pizzas) menuCategories[String(p.id)] = p.category || 'Classique'
    for (const f of menuData.friands) menuCategories[String(f.id)] = f.category || 'Friands'
    for (const d of menuData.drinks) menuCategories[String(d.id)] = d.category || 'Boissons'

    const toInsert: Array<{ item_id: string; name: string; category: string }> = []
    for (const p of menuData.pizzas) {
      if (!existingIds.has(String(p.id))) {
        toInsert.push({ item_id: String(p.id), name: p.name, category: p.category || 'Classique' })
      }
    }
    for (const f of menuData.friands) {
      if (!existingIds.has(String(f.id))) {
        toInsert.push({ item_id: String(f.id), name: f.name, category: f.category || 'Friands' })
      }
    }
    for (const d of menuData.drinks) {
      if (!existingIds.has(String(d.id))) {
        toInsert.push({ item_id: String(d.id), name: `${d.name} ${d.size || ''}`.trim(), category: d.category || 'Boissons' })
      }
    }

    let updatedCount = 0
    for (const stock of existingStocks) {
      const expectedCategory = menuCategories[stock.item_id]
      if (expectedCategory && stock.category !== expectedCategory) {
        await updateStock(stock.item_id, { category: expectedCategory })
        updatedCount++
      }
    }

    for (const row of toInsert) {
      await createStock({ item_id: row.item_id, name: row.name, category: row.category, quantity: 20, min_threshold: 5, unit: 'unité' })
    }

    const insertedCount = toInsert.length
    if (insertedCount === 0 && updatedCount === 0) {
      return NextResponse.json(
        { message: 'Tous les articles du menu sont déjà à jour dans les stocks', count: 0 },
        { status: 200 }
      )
    }
    const msg =
      insertedCount > 0 && updatedCount > 0
        ? `${insertedCount} article(s) ajouté(s), ${updatedCount} catégorie(s) corrigée(s)`
        : insertedCount > 0
          ? `${insertedCount} article(s) ajouté(s)`
          : `${updatedCount} catégorie(s) corrigée(s)`
    return NextResponse.json({ message: msg, count: insertedCount + updatedCount }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[POST /api/admin/stocks/seed] Error:', message)
    return NextResponse.json({ error: 'Failed to seed stocks' }, { status: 500 })
  }
}
