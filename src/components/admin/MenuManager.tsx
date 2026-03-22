'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, Search, Edit2, Check, X, Loader2, Upload,
  Eye, EyeOff, Star, Leaf, Droplets, ChevronDown, ChevronUp, Plus, Tag, Tags, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminCard, adminFocusRing } from '@/components/admin/adminUi'
import type { Product, ProductUpdate, ProductCreate } from '@/lib/productsStore'
import { ChefPizzaEditor } from './ChefPizzaEditor'
import { getCsrfToken } from '@/lib/csrf'
import { useAdminToast } from '@/components/admin/AdminToast'

function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
}

const TYPE_LABELS: Record<string, string> = {
  pizza: '🍕 Pizzas',
  friand: '🥟 Friands',
  drink: '🥤 Boissons',
  dessert: '🍮 Desserts',
}
const CATEGORY_ORDER = [
  'Classique', 'Du Chef',
  'Friands', 'Desserts', 'Boissons',
]

type AdminOptionToggleItem = { key: string; label: string; active: boolean; onToggle: () => void }

/** Grille d’options booléennes (dispo, populaire, etc.) — séparée des étiquettes carte. */
function AdminProductOptionTogglesSection({ toggles }: { toggles: AdminOptionToggleItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Options du produit</h4>
      <p className="mt-1 mb-3 text-xs text-slate-500 leading-snug">
        Disponibilité, mise en avant et caractéristiques. « Recette végétarienne » est une propriété du produit, pas une étiquette affichée comme badge.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {toggles.map(({ key, label, active, onToggle }) => (
          <button
            key={key}
            type="button"
            onClick={onToggle}
            className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2 text-center text-[11px] font-bold leading-tight transition-all ${
              active
                ? 'border-coral bg-white text-coral shadow-sm ring-1 ring-coral/15'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                active ? 'bg-coral/15 text-coral' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {active ? <Check size={15} strokeWidth={2.5} /> : <X size={15} strokeWidth={2} />}
            </span>
            <span className="px-0.5">{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function AdminBadgeLabelsSection({
  badgeLabels,
  onClearBadges,
  localCats,
  onToggleBadge,
  onDeleteCategory,
  addingCat,
  setAddingCat,
  newCatInput,
  setNewCatInput,
  newCatError,
  onAddCat,
  onCancelAddCat,
  newCatSaving,
}: {
  badgeLabels: string[]
  onClearBadges: () => void
  localCats: { id: number; name: string }[]
  onToggleBadge: (name: string, currentlySelected: boolean) => void
  onDeleteCategory: (id: number) => void
  addingCat: boolean
  setAddingCat: (v: boolean) => void
  newCatInput: string
  setNewCatInput: (v: string) => void
  newCatError: string | null
  onAddCat: () => void
  onCancelAddCat: () => void
  newCatSaving: boolean
}) {
  const noBadges = badgeLabels.length === 0
  return (
    <section className="rounded-2xl border border-amber-100/90 bg-gradient-to-b from-amber-50/50 to-white p-4 shadow-sm ring-1 ring-slate-100/80">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Étiquettes sur la carte</h4>
      <p className="mt-1 mb-3 text-xs text-slate-500 leading-snug">
        Badges optionnels (Nouveauté, Épicé…). Ils sont indépendants des options ci-dessus (un libellé peut ressembler sans être la même chose).
      </p>
      <div className="mb-3">
        <button
          type="button"
          onClick={onClearBadges}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition-all sm:w-auto ${
            noBadges
              ? 'border-coral bg-coral/5 text-coral ring-1 ring-coral/15'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {noBadges ? <Check size={16} strokeWidth={2.5} /> : <Tags size={16} className="text-slate-400" />}
          Aucune étiquette sur la carte
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {localCats.map(cat => {
          const active = badgeLabels.includes(cat.name)
          return (
            <div key={cat.id} className="relative group min-w-0">
              <button
                type="button"
                onClick={() => onToggleBadge(cat.name, active)}
                className={`flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2 text-center text-[11px] font-bold leading-tight transition-all ${
                  active
                    ? 'border-coral bg-white text-coral shadow-sm ring-1 ring-coral/15'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    active ? 'bg-coral/15 text-coral' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {active ? <Check size={15} strokeWidth={2.5} /> : <Tag size={15} strokeWidth={2} />}
                </span>
                <span className="line-clamp-2 px-0.5">{cat.name}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteCategory(cat.id)}
                className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-white opacity-0 shadow-sm transition-opacity hover:bg-red-600 group-hover:opacity-100"
                title="Supprimer cette étiquette (liste globale)"
              >
                ×
              </button>
            </div>
          )
        })}
        {!addingCat ? (
          <button
            type="button"
            onClick={() => setAddingCat(true)}
            className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-200 bg-white px-2 py-2 text-center text-[11px] font-bold text-slate-400 transition-all hover:border-coral/50 hover:text-coral"
          >
            <Plus size={18} />
            Ajouter une étiquette
          </button>
        ) : (
          <div className="col-span-full flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            <input
              type="text"
              value={newCatInput}
              onChange={e => setNewCatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAddCat()
                }
              }}
              placeholder="Nom de la nouvelle étiquette…"
              autoFocus
              className="min-w-[10rem] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
            />
            <button
              type="button"
              onClick={onAddCat}
              disabled={!newCatInput.trim() || newCatSaving}
              className="flex items-center gap-1 rounded-xl bg-coral px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-burnt-orange disabled:opacity-40"
            >
              {newCatSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              OK
            </button>
            <button
              type="button"
              onClick={onCancelAddCat}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-500"
              aria-label="Annuler"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      {newCatError && <p className="mt-2 text-xs text-red-500">{newCatError}</p>}
    </section>
  )
}

// ─── ProductCreateModal ───────────────────────────────────────────────────────

const EMPTY_FORM = {
  type:        'pizza' as 'pizza' | 'friand' | 'drink' | 'dessert',
  name:        '',
  price:       12,
  category:    'Classique',
  description: '',
  ingredients: '',
  image_url:   '',
  image_urls:  [] as string[],
  available:   true,
  popular:     false,
  vegetarian:  false,
  badge_labels: [] as string[],
  sauce_au_choix: false,
}

function ProductCreateModal({
  onCreate,
  onClose,
  badgeCategories,
  onAddBadgeCategory,
  onDeleteBadgeCategory,
}: {
  onCreate: (data: ProductCreate) => Promise<void>
  onClose: () => void
  badgeCategories: { id: number; name: string }[]
  onAddBadgeCategory: (name: string) => Promise<{ id: number; name: string }>
  onDeleteBadgeCategory: (id: number) => Promise<void>
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [localCats, setLocalCats]         = useState<{ id: number; name: string }[]>(() => [...badgeCategories])
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [uploading, setUploading]         = useState(false)
  const [uploadError, setUploadError]     = useState<string | null>(null)
  const [addingCat, setAddingCat]         = useState(false)
  const [newCatInput, setNewCatInput]     = useState('')
  const [newCatSaving, setNewCatSaving]   = useState(false)
  const [newCatError, setNewCatError]     = useState<string | null>(null)

  useEffect(() => { setLocalCats(badgeCategories) }, [badgeCategories])

  const handleAddCat = async () => {
    const name = newCatInput.trim()
    if (!name) return
    setNewCatSaving(true)
    setNewCatError(null)
    try {
      const newCat = await onAddBadgeCategory(name)
      setLocalCats(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(f => ({ ...f, badge_labels: [...f.badge_labels, name] }))
      setNewCatInput('')
      setAddingCat(false)
    } catch (e: unknown) {
      setNewCatError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setNewCatSaving(false)
    }
  }

  const handleDeleteCat = async (id: number) => {
    const catName = localCats.find(c => c.id === id)?.name
    await onDeleteBadgeCategory(id)
    setLocalCats(prev => prev.filter(c => c.id !== id))
    if (catName) setForm(f => ({ ...f, badge_labels: f.badge_labels.filter(l => l !== catName) }))
  }

  const isPizza  = form.type === 'pizza'
  const isDrink  = form.type === 'drink'
  const images   = isPizza ? form.image_urls : (form.image_url ? [form.image_url] : [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadError('Image invalide.'); return }
    if (file.size > 5 * 1024 * 1024)     { setUploadError('Max 5 Mo.'); return }
    setUploadError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() }, body: fd })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) {
        if (isPizza) {
          setForm(f => ({ ...f, image_urls: [...f.image_urls, data.url], image_url: f.image_urls.length === 0 ? data.url : f.image_url }))
        } else {
          setForm(f => ({ ...f, image_url: data.url }))
        }
      } else {
        setUploadError(data.error || 'Erreur upload')
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    if (isPizza) {
      const next = form.image_urls.filter((_, i) => i !== index)
      setForm(f => ({ ...f, image_urls: next, image_url: next[0] ?? '' }))
    } else {
      setForm(f => ({ ...f, image_url: '' }))
    }
  }

  const handleCreate = async () => {
    if (!form.name.trim()) { setError('Le nom est obligatoire'); return }
    if (form.price <= 0)   { setError('Le prix doit être positif'); return }
    setSaving(true)
    setError(null)
    try {
      await onCreate({
        type:        form.type,
        name:        form.name.trim(),
        price:       Number(form.price),
        category:    form.category.trim() || null,
        description: form.description.trim() || null,
        ingredients: isDrink ? null : form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
        image_url:   (isPizza ? form.image_urls[0] : form.image_url)?.trim() || null,
        image_urls:  isPizza ? form.image_urls.filter(Boolean) : [],
        available:   form.available,
        popular:     form.popular,
        vegetarian:  form.vegetarian,
        badge_labels: form.badge_labels,
        ...(isPizza && { sauce_au_choix: form.sauce_au_choix }),
      })
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <h3 className="text-xl font-black text-slate-900">Nouveau produit</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type de produit</label>
            <div className="grid grid-cols-2 gap-2">
              {(['pizza', 'friand', 'drink', 'dessert'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const cat = t === 'pizza' ? 'Classique' : t === 'friand' ? 'Friands' : t === 'dessert' ? 'Desserts' : 'Boissons'
                    setForm(f => ({ ...f, type: t, category: cat }))
                  }}
                  className={`py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                    form.type === t
                      ? 'border-coral bg-coral/5 text-coral'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {t === 'pizza' ? '🍕 Pizza' : t === 'friand' ? '🥟 Friand' : t === 'dessert' ? '🍮 Dessert' : '🥤 Boisson'}
                </button>
              ))}
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nom *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex : Margherita, Coca-Cola…"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-900 font-semibold"
            />
          </div>

          {/* Prix + Catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prix (€) *</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-900 font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Catégorie</label>
              {isPizza ? (
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-700"
                >
                  <option value="Classique">Classique</option>
                  <option value="Du Chef">Du Chef</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-700"
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-700 resize-none"
            />
          </div>

          {/* Ingrédients */}
          {!isDrink && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Ingrédients (un par ligne)
              </label>
              <textarea
                rows={4}
                value={form.ingredients}
                onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-700 resize-none font-mono text-sm"
              />
            </div>
          )}

          {/* Photo(s) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {isPizza ? 'Photos (la 1re = principale)' : 'Photo'}
            </label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-coral/50 hover:bg-coral/5 transition-colors text-slate-600 font-semibold">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={handleImageUpload} />
                {uploading ? <Loader2 size={20} className="animate-spin text-coral" /> : <Upload size={20} className="text-coral" />}
                {uploading ? 'Upload…' : isPizza ? 'Ajouter une image' : 'Choisir une image'}
              </label>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                      <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      {index === 0 && isPizza && (
                        <span className="absolute bottom-0 left-0 right-0 bg-coral/90 text-white text-[10px] font-bold text-center py-0.5">Principale</span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeImage(index)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            </div>
          </div>

          {/* Options produit + étiquettes carte — sections séparées */}
          <div className="space-y-4">
            <AdminProductOptionTogglesSection
              toggles={[
                {
                  key: 'available',
                  label: 'Disponible',
                  active: form.available,
                  onToggle: () => setForm(f => ({ ...f, available: !f.available })),
                },
                {
                  key: 'popular',
                  label: 'Populaire',
                  active: form.popular,
                  onToggle: () => setForm(f => ({ ...f, popular: !f.popular })),
                },
                {
                  key: 'vegetarian',
                  label: 'Recette végétarienne',
                  active: form.vegetarian,
                  onToggle: () => setForm(f => ({ ...f, vegetarian: !f.vegetarian })),
                },
                ...(isPizza
                  ? [
                      {
                        key: 'sauce_au_choix',
                        label: 'Sauce au choix',
                        active: form.sauce_au_choix,
                        onToggle: () => setForm(f => ({ ...f, sauce_au_choix: !f.sauce_au_choix })),
                      },
                    ]
                  : []),
              ]}
            />
            <AdminBadgeLabelsSection
              badgeLabels={form.badge_labels}
              onClearBadges={() => setForm(f => ({ ...f, badge_labels: [] }))}
              localCats={localCats}
              onToggleBadge={(name, active) =>
                setForm(f => ({
                  ...f,
                  badge_labels: active ? f.badge_labels.filter(l => l !== name) : [...f.badge_labels, name],
                }))
              }
              onDeleteCategory={id => { void handleDeleteCat(id) }}
              addingCat={addingCat}
              setAddingCat={setAddingCat}
              newCatInput={newCatInput}
              setNewCatInput={setNewCatInput}
              newCatError={newCatError}
              onAddCat={() => { void handleAddCat() }}
              onCancelAddCat={() => { setAddingCat(false); setNewCatInput(''); setNewCatError(null) }}
              newCatSaving={newCatSaving}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white rounded-b-3xl px-6 py-4 border-t border-slate-100 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
            Annuler
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-coral text-white font-black hover:bg-burnt-orange disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {saving ? 'Création…' : 'Créer le produit'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ProductEditModal ─────────────────────────────────────────────────────────

function ProductEditModal({
  product,
  onSave,
  onClose,
  badgeCategories,
  onAddBadgeCategory,
  onDeleteBadgeCategory,
}: {
  product: Product
  onSave: (patch: ProductUpdate) => Promise<void>
  onClose: () => void
  badgeCategories: { id: number; name: string }[]
  onAddBadgeCategory: (name: string) => Promise<{ id: number; name: string }>
  onDeleteBadgeCategory: (id: number) => Promise<void>
}) {
  const initialImages = (product as { image_urls?: string[] | null }).image_urls?.length
    ? [...(product as { image_urls: string[] }).image_urls]
    : (product.image_url ? [product.image_url] : [])

  const [form, setForm] = useState({
    name:        product.name,
    price:       product.price,
    description: product.description ?? '',
    ingredients: (product.ingredients ?? []).join('\n'),
    image_url:   product.image_url ?? '',
    image_urls:  initialImages as string[],
    slider_image_url: (product as { slider_image_url?: string | null }).slider_image_url ?? '',
    show_in_slider:  (product as { show_in_slider?: boolean }).show_in_slider ?? true,
    category:    product.category ?? '',
    available:   product.available,
    popular:     product.popular,
    vegetarian:  product.vegetarian,
    badge_labels: (product.badge_labels ?? []) as string[],
    sauce_au_choix: product.type === 'pizza' ? (product.sauce_au_choix ?? false) : false,
  })
  const [localCats, setLocalCats]         = useState<{ id: number; name: string }[]>(() => {
    const cats = [...badgeCategories]
    // Ajoute les badges existants du produit qui ne sont pas encore dans les catégories
    for (const lbl of (product.badge_labels ?? [])) {
      if (!cats.some(c => c.name === lbl)) cats.push({ id: -1, name: lbl })
    }
    return cats.sort((a, b) => a.name.localeCompare(b.name))
  })
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [uploading, setUploading]         = useState(false)
  const [uploadError, setUploadError]     = useState<string | null>(null)
  const [addingCat, setAddingCat]         = useState(false)
  const [newCatInput, setNewCatInput]     = useState('')
  const [newCatSaving, setNewCatSaving]   = useState(false)
  const [newCatError, setNewCatError]     = useState<string | null>(null)

  useEffect(() => { setLocalCats(badgeCategories) }, [badgeCategories])

  const handleAddCat = async () => {
    const name = newCatInput.trim()
    if (!name) return
    setNewCatSaving(true)
    setNewCatError(null)
    try {
      const newCat = await onAddBadgeCategory(name)
      setLocalCats(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(f => ({ ...f, badge_labels: [...f.badge_labels, name] }))
      setNewCatInput('')
      setAddingCat(false)
    } catch (e: unknown) {
      setNewCatError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setNewCatSaving(false)
    }
  }

  const handleDeleteCat = async (id: number) => {
    const catName = localCats.find(c => c.id === id)?.name
    if (id > 0) await onDeleteBadgeCategory(id)
    setLocalCats(prev => prev.filter(c => c.id !== id))
    if (catName) setForm(f => ({ ...f, badge_labels: f.badge_labels.filter(l => l !== catName) }))
  }

  const isPizza = product.type === 'pizza'
  const images = isPizza ? form.image_urls : (form.image_url ? [form.image_url] : [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Choisissez une image (JPEG, PNG, WebP, GIF).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image trop lourde (max 5 Mo).')
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() },
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUploadError(data.error || 'Erreur d’upload')
        return
      }
      if (data.url) {
        if (isPizza) {
          setForm(f => ({ ...f, image_urls: [...f.image_urls, data.url], image_url: f.image_urls.length === 0 ? data.url : f.image_url }))
        } else {
          setForm(f => ({ ...f, image_url: data.url }))
        }
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    if (isPizza) {
      const next = form.image_urls.filter((_, i) => i !== index)
      setForm(f => ({ ...f, image_urls: next, image_url: next[0] ?? '' }))
    } else {
      setForm(f => ({ ...f, image_url: '' }))
    }
  }

  const setPrimaryImage = (index: number) => {
    if (!isPizza || index === 0) return
    const next = [...form.image_urls]
    const [removed] = next.splice(index, 1)
    next.unshift(removed)
    setForm(f => ({ ...f, image_urls: next, image_url: next[0] ?? '' }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave({
        name:        form.name.trim(),
        price:       Number(form.price),
        description: form.description.trim() || null,
        ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
        image_url:   (isPizza ? form.image_urls[0] : form.image_url)?.trim() || null,
        image_urls:  isPizza ? form.image_urls.filter(Boolean) : undefined,
        slider_image_url: isPizza ? (form.slider_image_url?.trim() || null) : undefined,
        ...(isPizza && { show_in_slider: form.show_in_slider }),
        category:    form.category.trim() || null,
        available:   form.available,
        popular:     form.popular,
        vegetarian:  form.vegetarian,
        badge_labels: form.badge_labels,
        ...(product.type === 'pizza' && { sauce_au_choix: form.sauce_au_choix }),
      })
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header modal */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <h3 className="text-xl font-black text-slate-900">Modifier — {product.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-900 font-semibold"
            />
          </div>

          {/* Prix + Catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prix (€)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-900 font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Catégorie</label>
              {product.type === 'pizza' ? (
                <select
                  value={form.category || 'Classique'}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-700"
                >
                  <option value="Classique">Classique</option>
                  <option value="Du Chef">Du Chef</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-700"
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-700 resize-none"
            />
          </div>

          {/* Ingrédients */}
          {product.type !== 'drink' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Ingrédients (un par ligne)
              </label>
              <textarea
                rows={5}
                value={form.ingredients}
                onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/10 text-slate-700 resize-none font-mono text-sm"
              />
            </div>
          )}

          {/* Photo(s) — une image pour friands/boissons, galerie pour pizzas */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {isPizza ? 'Photos (la 1re = principale)' : 'Photo'}
            </label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-coral/50 hover:bg-coral/5 transition-colors text-slate-600 font-semibold">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploading}
                  onChange={handleImageUpload}
                />
                {uploading ? <Loader2 size={20} className="animate-spin text-coral" /> : <Upload size={20} className="text-coral" />}
                {uploading ? 'Upload…' : isPizza ? 'Ajouter une image' : 'Choisir une image'}
              </label>
              <div className="flex flex-wrap gap-2">
                {images.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative group w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                    <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    {index === 0 && isPizza && (
                      <span className="absolute bottom-0 left-0 right-0 bg-coral/90 text-white text-[10px] font-bold text-center py-0.5">Principale</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {isPizza && index > 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="p-1.5 bg-white rounded-lg text-xs font-bold text-slate-800"
                          title="Définir comme principale"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        aria-label="Supprimer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {uploadError && <p className="mt-1.5 text-sm text-red-600">{uploadError}</p>}
            {images.length === 0 && <p className="mt-1 text-xs text-slate-400">JPEG, PNG, WebP ou GIF — max 5 Mo</p>}
          </div>

          {/* Slider page d'accueil — pizzas + Pizza du Chef */}
          {isPizza && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Slider page d&apos;accueil
              </label>
              <p className="text-xs text-slate-500 mb-2">Optionnel. Image réservée au bandeau d’accueil (ex. pizza détourée, fond transparent).</p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-coral/50 hover:bg-coral/5 transition-colors text-slate-600 font-semibold">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file || !file.type.startsWith('image/')) return
                      if (file.size > 5 * 1024 * 1024) { setUploadError('Image trop lourde (max 5 Mo).'); return }
                      setUploadError(null)
                      setUploading(true)
                      try {
                        const formData = new FormData()
                        formData.append('file', file)
                        const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() }, body: formData })
                        const data = await res.json().catch(() => ({}))
                        if (res.ok && data.url) setForm(f => ({ ...f, slider_image_url: data.url }))
                        else setUploadError(data.error || 'Erreur d’upload')
                      } finally { setUploading(false); e.target.value = '' }
                    }}
                  />
                  {uploading ? <Loader2 size={20} className="animate-spin text-coral" /> : <Upload size={20} className="text-coral" />}
                  {form.slider_image_url ? 'Remplacer l’image slider' : 'Ajouter une image pour le slider'}
                </label>
                {form.slider_image_url && (
                  <div className="relative group w-32 h-24 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                    <img src={form.slider_image_url} alt="Slider" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, slider_image_url: '' }))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-white text-xs font-bold"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, show_in_slider: !f.show_in_slider }))}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-bold transition-all ${
                    form.show_in_slider
                      ? 'border-coral bg-white text-coral shadow-sm ring-1 ring-coral/15'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="leading-snug">Afficher cette pizza dans le slider d&apos;accueil</span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      form.show_in_slider ? 'bg-coral/15 text-coral' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {form.show_in_slider ? <Check size={16} strokeWidth={2.5} /> : <X size={16} />}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Options produit + étiquettes carte — sections séparées */}
          <div className="space-y-4">
            <AdminProductOptionTogglesSection
              toggles={[
                {
                  key: 'available',
                  label: 'Disponible',
                  active: form.available,
                  onToggle: () => setForm(f => ({ ...f, available: !f.available })),
                },
                {
                  key: 'popular',
                  label: 'Populaire',
                  active: form.popular,
                  onToggle: () => setForm(f => ({ ...f, popular: !f.popular })),
                },
                {
                  key: 'vegetarian',
                  label: 'Recette végétarienne',
                  active: form.vegetarian,
                  onToggle: () => setForm(f => ({ ...f, vegetarian: !f.vegetarian })),
                },
                ...(product.type === 'pizza'
                  ? [
                      {
                        key: 'sauce_au_choix',
                        label: 'Sauce au choix',
                        active: form.sauce_au_choix,
                        onToggle: () => setForm(f => ({ ...f, sauce_au_choix: !f.sauce_au_choix })),
                      },
                    ]
                  : []),
              ]}
            />
            <AdminBadgeLabelsSection
              badgeLabels={form.badge_labels}
              onClearBadges={() => setForm(f => ({ ...f, badge_labels: [] }))}
              localCats={localCats}
              onToggleBadge={(name, active) =>
                setForm(f => ({
                  ...f,
                  badge_labels: active ? f.badge_labels.filter(l => l !== name) : [...f.badge_labels, name],
                }))
              }
              onDeleteCategory={id => { void handleDeleteCat(id) }}
              addingCat={addingCat}
              setAddingCat={setAddingCat}
              newCatInput={newCatInput}
              setNewCatInput={setNewCatInput}
              newCatError={newCatError}
              onAddCat={() => { void handleAddCat() }}
              onCancelAddCat={() => { setAddingCat(false); setNewCatInput(''); setNewCatError(null) }}
              newCatSaving={newCatSaving}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        {/* Footer modal */}
        <div className="sticky bottom-0 bg-white rounded-b-3xl px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-coral text-white font-black hover:bg-burnt-orange disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onToggleAvailable }: {
  product: Product
  onEdit: (p: Product) => void
  onToggleAvailable: (p: Product) => void
}) {
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md ${
      !product.available ? 'opacity-60 border-slate-200' : 'border-slate-100 hover:border-coral/30'
    }`}>
      {/* Image */}
      <div className="relative h-28 bg-cream overflow-hidden">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">
              {product.type === 'pizza' ? '🍕' : product.type === 'friand' ? '🥟' : '🥤'}
            </div>
        }
        {!product.available && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">Indisponible</span>
          </div>
        )}
        {product.is_chef_special && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">
            🌟 Chef
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{product.name}</h4>
          <span className="font-black text-coral shrink-0">{product.price}€</span>
        </div>

        {product.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{product.description}</p>
        )}

        <div className="flex gap-1 flex-wrap mb-3">
          {product.popular    && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Populaire</span>}
          {product.vegetarian && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Végétarien</span>}
          {(product.badge_labels ?? []).map(l => <span key={l} className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{l}</span>)}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-coral hover:text-white text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors touch-manipulation"
          >
            <Edit2 size={13} /> Modifier
          </button>
          <button
            onClick={() => onToggleAvailable(product)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors touch-manipulation ${
              product.available
                ? 'bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600'
                : 'bg-green-50 hover:bg-green-100 text-green-700'
            }`}
          >
            {product.available ? <><EyeOff size={13} /> Désactiver</> : <><Eye size={13} /> Activer</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MenuManager principal ────────────────────────────────────────────────────

export function MenuManager() {
  const { showToast } = useAdminToast()
  const [products, setProducts]          = useState<Product[]>([])
  const [loading, setLoading]            = useState(true)
  const [seeding, setSeeding]            = useState(false)
  const [searchTerm, setSearchTerm]      = useState('')
  const [editingProduct, setEditing]     = useState<Product | null>(null)
  const [creating, setCreating]          = useState(false)
  const [error, setError]                = useState<string | null>(null)
  const [collapsedTypes, setCollapsed]   = useState<Set<string>>(new Set())
  const [badgeCategories, setBadgeCategories] = useState<{ id: number; name: string }[]>([])
  const [badgesSectionOpen, setBadgesSectionOpen] = useState(false)
  const [newBadgeInput, setNewBadgeInput] = useState('')
  const [badgeSaving, setBadgeSaving]    = useState(false)
  const [badgeError, setBadgeError]      = useState<string | null>(null)

  const loadBadges = useCallback(async () => {
    const res = await fetch('/api/admin/badge-categories', { headers: { 'x-admin-pin': getAdminPin() } })
    const data = await res.json().catch(() => ({}))
    if (res.ok && Array.isArray(data.categories)) setBadgeCategories(data.categories)
  }, [])

  const addBadgeCategory = async (name: string): Promise<{ id: number; name: string }> => {
    const res = await fetch('/api/admin/badge-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() },
      body: JSON.stringify({ name }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Erreur')
    const cat = (data.category ?? { id: Date.now(), name }) as { id: number; name: string }
    setBadgeCategories(prev =>
      [...prev, cat].sort((a, b) => a.name.localeCompare(b.name))
    )
    return cat
  }

  const deleteBadgeCategory = async (id: number) => {
    const res = await fetch(`/api/admin/badge-categories/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() },
    })
    if (!res.ok) return
    setBadgeCategories(prev => prev.filter(c => c.id !== id))
  }

  const handleAddBadge = async () => {
    const name = newBadgeInput.trim()
    if (!name) return
    setBadgeSaving(true)
    setBadgeError(null)
    try {
      await addBadgeCategory(name)
      setNewBadgeInput('')
    } catch (e: unknown) {
      setBadgeError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setBadgeSaving(false)
    }
  }

  const handleDeleteBadge = (id: number) => deleteBadgeCategory(id)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'x-admin-pin': getAdminPin() },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(data.products)) {
        setProducts(data.products)
      } else {
        setError(data.error || 'Impossible de charger le catalogue')
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(); loadBadges() }, [load, loadBadges])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/products/seed', {
        method: 'POST',
        headers: { 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { await load(); showToast('success', data.message || 'Catalogue synchronisé') }
      else setError(data.error || 'Erreur seed')
    } finally {
      setSeeding(false)
    }
  }

  const handleSaveProduct = async (product: Product, patch: ProductUpdate) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() },
      body: JSON.stringify(patch),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
    setProducts(prev => prev.map(p => p.id === product.id ? data.product : p))
  }

  const handleToggleAvailable = async (product: Product) => {
    await handleSaveProduct(product, { available: !product.available }).catch(() => {})
  }

  const handleCreateProduct = async (data: ProductCreate) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() },
      body: JSON.stringify(data),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error || `Erreur ${res.status}`)
    setProducts(prev => [...prev, json.product])
  }

  // Pizza du Chef (id menu_id 900)
  const chefProduct = products.find(p => p.is_chef_special)

  // Filtre search
  const filtered = products.filter(p =>
    !p.is_chef_special &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (p.category ?? '').toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Grouper par type
  const grouped: Record<string, Product[]> = {}
  for (const p of filtered) {
    const key = p.type
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  }
  const typeOrder = ['pizza', 'friand', 'drink']

  const toggleCollapse = (type: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-10 w-10 animate-spin text-coral" aria-label="Chargement" />
    </div>
  )

  return (
    <div className="space-y-6 pb-20 md:space-y-8">
      {/* Header */}
      <div
        className={cn(
          adminCard,
          'flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6'
        )}
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Gestion du menu
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {products.length} produits · infos affichées sur le site
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="relative min-w-0 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
              aria-hidden
            />
            <input
              type="text"
              placeholder="Rechercher…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={cn(
                'w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-4 text-base text-slate-900 sm:w-56',
                adminFocusRing,
                'focus:border-coral'
              )}
            />
          </div>
          <button
            type="button"
            onClick={load}
            className={cn(
              'inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-100 px-4 font-semibold text-slate-800 transition-colors hover:bg-slate-200',
              adminFocusRing
            )}
          >
            <RefreshCw size={16} aria-hidden /> Actualiser
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={cn(
              'inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-coral to-burnt-orange px-4 font-bold text-white shadow-md shadow-coral/20 transition hover:brightness-[1.03]',
              adminFocusRing
            )}
          >
            <Plus size={16} aria-hidden /> Nouveau produit
          </button>
          {products.length === 0 && (
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className={cn(
                'inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-coral to-burnt-orange px-4 font-bold text-white shadow-md shadow-coral/20 transition hover:brightness-[1.03] disabled:opacity-60',
                adminFocusRing
              )}
            >
              {seeding ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Download size={16} aria-hidden />}
              {seeding ? 'Import…' : 'Importer le catalogue'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 flex items-center gap-3">
          <X size={18} /> {error}
          {products.length === 0 && (
            <button onClick={handleSeed} disabled={seeding} className="ml-auto bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
              {seeding ? 'Import…' : 'Importer le catalogue'}
            </button>
          )}
        </div>
      )}

      {/* Gestion des badges */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <button
          onClick={() => setBadgesSectionOpen(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Tag size={18} className="text-coral" />
            <span className="font-bold text-slate-800">Gestion des badges</span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{badgeCategories.length}</span>
          </div>
          {badgesSectionOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {badgesSectionOpen && (
          <div className="px-6 pb-6 border-t border-slate-100 pt-4 space-y-4">
            <p className="text-xs text-slate-400">Ces badges s'affichent sur les fiches produits du site. Ajoutez ou supprimez selon vos besoins.</p>
            <div className="flex flex-wrap gap-2">
              {badgeCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5">
                  <span className="text-xs font-bold text-purple-700">{cat.name}</span>
                  <button
                    onClick={() => handleDeleteBadge(cat.id)}
                    className="text-purple-400 hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {badgeCategories.length === 0 && <p className="text-sm text-slate-400">Aucun badge défini</p>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBadgeInput}
                onChange={e => setNewBadgeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddBadge()}
                placeholder="Nouveau badge (ex: Épicé, Nouveauté…)"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coral/50"
              />
              <button
                onClick={handleAddBadge}
                disabled={!newBadgeInput.trim() || badgeSaving}
                className="flex items-center gap-1.5 bg-coral text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-burnt-orange disabled:opacity-40 transition-colors"
              >
                {badgeSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Ajouter
              </button>
            </div>
            {badgeError && <p className="text-xs text-red-600">{badgeError}</p>}
          </div>
        )}
      </div>

      {/* Pizza du Chef en haut */}
      {chefProduct && (
        <ChefPizzaEditor
          product={chefProduct}
          onUpdated={updated => setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))}
        />
      )}

      {/* Catalogue par type */}
      {typeOrder.filter(t => grouped[t]?.length > 0).map(type => {
        const items = grouped[type]
        const collapsed = collapsedTypes.has(type)
        return (
          <section key={type}>
            <button
              onClick={() => toggleCollapse(type)}
              className="w-full flex items-center justify-between mb-4 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type === 'pizza' ? '🍕' : type === 'friand' ? '🥟' : '🥤'}</span>
                <h3 className="text-xl font-black text-slate-800">{TYPE_LABELS[type]}</h3>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{items.length}</span>
              </div>
              <div className="p-1 rounded-lg text-slate-400 group-hover:text-coral transition-colors">
                {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </div>
            </button>

            {!collapsed && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={setEditing}
                    onToggleAvailable={handleToggleAvailable}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {products.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-400 text-lg">Aucun produit pour "{searchTerm}"</p>
        </div>
      )}

      {/* Modal de création */}
      {creating && (
        <ProductCreateModal
          onCreate={handleCreateProduct}
          onClose={() => setCreating(false)}
          badgeCategories={badgeCategories}
          onAddBadgeCategory={addBadgeCategory}
          onDeleteBadgeCategory={deleteBadgeCategory}
        />
      )}

      {/* Modal d'édition */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onSave={patch => handleSaveProduct(editingProduct, patch)}
          onClose={() => setEditing(null)}
          badgeCategories={badgeCategories}
          onAddBadgeCategory={addBadgeCategory}
          onDeleteBadgeCategory={deleteBadgeCategory}
        />
      )}
    </div>
  )
}
