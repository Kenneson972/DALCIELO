'use client'

import { useState } from 'react'
import { generateSlug } from '@/lib/utils'
import {
  Sparkles, Save, Loader2, Calendar, X, Upload, Power,
  ChevronDown, ChevronUp, ImageIcon, AlignLeft, ListOrdered, Star,
} from 'lucide-react'
import { getCsrfToken } from '@/lib/csrf'
import { useAdminToast } from '@/components/admin/AdminToast'
import type { Product } from '@/lib/productsStore'

function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
}

interface ChefPizzaEditorProps {
  product: Product
  onUpdated: (p: Product) => void
}

export function ChefPizzaEditor({ product, onUpdated }: ChefPizzaEditorProps) {
  const { showToast } = useAdminToast()
  const [open, setOpen] = useState(false)

  const initialChefImages = (product as { image_urls?: string[] | null }).image_urls?.length
    ? [...(product as { image_urls: string[] }).image_urls]
    : (product.image_url ? [product.image_url] : [])
  const [form, setForm] = useState({
    name:            product.name,
    price:           product.price,
    description:     product.description ?? '',
    ingredients:     (product.ingredients ?? []).join('\n'),
    image_urls:      initialChefImages as string[],
    slider_image_url: (product as { slider_image_url?: string | null }).slider_image_url ?? '',
    show_in_slider:  (product as { show_in_slider?: boolean }).show_in_slider ?? true,
    chef_valid_until: product.chef_valid_until ?? '',
  })
  const [isActive, setIsActive] = useState(product.available)
  const [toggling, setToggling] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleToggleActive = async () => {
    setToggling(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify({ available: !isActive }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || `Erreur ${res.status}`); return }
      setIsActive(!isActive)
      onUpdated(data.product)
    } catch {
      setError('Erreur réseau')
    } finally {
      setToggling(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setUploadError(file.size > 5 * 1024 * 1024 ? 'Image trop lourde (max 5 Mo).' : 'Choisissez une image (JPEG, PNG, WebP, GIF).')
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() }, body: formData })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) setForm(f => ({ ...f, image_urls: [...f.image_urls, data.url] }))
      else setUploadError(data.error || "Erreur d'upload")
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeChefImage = (index: number) => {
    setForm(f => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== index) }))
  }
  const setPrimaryChefImage = (index: number) => {
    if (index === 0) return
    setForm(f => {
      const next = [...f.image_urls]
      const [removed] = next.splice(index, 1)
      next.unshift(removed)
      return { ...f, image_urls: next }
    })
  }

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(product.updated_at).getTime()) / 86_400_000
  )

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const name = form.name.trim()
      const slug = generateSlug(name) || 'pizza-du-chef'
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify({
          name,
          slug,
          price:            Number(form.price),
          description:      form.description.trim() || null,
          ingredients:      form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
          image_url:        (form.image_urls[0]?.trim()) || null,
          image_urls:        form.image_urls.filter(Boolean),
          slider_image_url: form.slider_image_url.trim() || null,
          show_in_slider:   form.show_in_slider,
          chef_valid_until: form.chef_valid_until || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || `Erreur ${res.status}`); return }
      onUpdated(data.product)
      showToast('success', 'Pizza du Chef mise à jour !')
    } catch {
      setError('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const freshnessColor =
    daysSinceUpdate > 14 ? 'bg-red-100 text-red-700 border-red-200' :
    daysSinceUpdate > 10 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                           'bg-emerald-100 text-emerald-700 border-emerald-200'

  const label = (text: string) => (
    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">{text}</p>
  )

  return (
    <div className={`rounded-3xl border shadow-md transition-all duration-200 ${
      isActive
        ? 'border-amber-200/90 bg-gradient-to-br from-amber-50/95 to-orange-50/80 shadow-amber-100/60'
        : 'border-slate-200 bg-slate-50/80 shadow-slate-100/60'
    }`}>

      {/* ── En-tête cliquable ── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
            isActive ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-500'
          }`}>
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-base font-black tracking-tight ${isActive ? 'text-amber-900' : 'text-slate-600'}`}>
                Pizza du Chef
              </h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                isActive ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'
              }`}>
                {isActive ? 'En ligne' : 'Désactivée'}
              </span>
            </div>
            {/* Aperçu rapide (nom + prix) visible quand fermé */}
            {!open && (
              <p className="mt-0.5 truncate text-sm text-amber-700/80 font-medium">
                {form.name || '—'} · {form.price != null ? `${form.price} €` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {/* Badge fraîcheur */}
          <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${freshnessColor}`}>
            <Calendar size={11} />
            {daysSinceUpdate}j{daysSinceUpdate > 14 ? ' — À renouveler' : ''}
          </span>
          {/* Chevron */}
          <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
            open ? 'bg-amber-200/70 text-amber-900' : 'bg-white/70 text-slate-500 hover:bg-amber-100'
          }`}>
            {open ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
          </span>
        </div>
      </button>

      {/* ── Corps (collapsible) ── */}
      {open && (
        <div className="border-t border-amber-200/60 px-6 pb-6 pt-5 space-y-6">

          {/* Bandeau désactivée */}
          {!isActive && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Power size={18} className="shrink-0 text-slate-400" />
              <div>
                <p className="text-sm font-bold text-slate-700">Pizza du Chef désactivée</p>
                <p className="text-xs text-slate-500">Elle n&apos;apparaît plus sur le site.</p>
              </div>
            </div>
          )}

          {/* ── Section 1 : Identité ── */}
          <section className="space-y-4 rounded-2xl border border-amber-100 bg-white/70 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Identité</p>

            {/* Nom */}
            <div>
              {label('Nom de la création *')}
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex. Royale Antillaise, Chorizo Créole…"
                className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-lg font-semibold text-slate-900 placeholder:text-slate-300 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Prix */}
              <div>
                {label('Prix (€) *')}
                <input
                  type="number"
                  min={5}
                  step={0.5}
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                  className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-xl font-bold text-slate-900 focus:border-amber-400 focus:outline-none"
                />
              </div>
              {/* Date */}
              <div>
                {label('Valable jusqu\'au')}
                <input
                  type="date"
                  value={form.chef_valid_until}
                  onChange={e => setForm(f => ({ ...f, chef_valid_until: e.target.value }))}
                  className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-slate-700 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Toggle actif */}
            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Power size={15} />
                {isActive ? 'Pizza visible sur le site' : 'Pizza masquée du site'}
              </div>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={toggling}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {toggling ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                {isActive ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </section>

          {/* ── Section 2 : Contenu ── */}
          <section className="space-y-4 rounded-2xl border border-amber-100 bg-white/70 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              <AlignLeft size={12} className="inline mr-1.5" />Contenu
            </p>

            <div>
              {label('Description (affichée au client)')}
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Décrivez les saveurs, l'inspiration…"
                className="w-full resize-none rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-slate-700 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              {label('Ingrédients (un par ligne)')}
              <textarea
                rows={5}
                value={form.ingredients}
                onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                placeholder={"Base tomate\nMozzarella\nEmmental\nPoulet colombo\nOignon rouge"}
                className="w-full resize-none rounded-xl border-2 border-amber-200 bg-white px-4 py-3 font-mono text-sm text-slate-700 focus:border-amber-400 focus:outline-none"
              />
              <p className="mt-1 text-xs text-amber-700/70">Un ingrédient par ligne — affiché sous le nom sur la fiche produit</p>
            </div>
          </section>

          {/* ── Section 3 : Photos ── */}
          <section className="space-y-3 rounded-2xl border border-amber-100 bg-white/70 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              <ImageIcon size={12} className="inline mr-1.5" />Photos · la 1re = principale
            </p>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-white px-4 py-3 font-semibold text-amber-900 transition-colors hover:border-amber-500 hover:bg-amber-50">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={handleImageUpload} />
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploading ? 'Upload en cours…' : 'Ajouter une photo'}
            </label>

            {form.image_urls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.image_urls.map((url, index) => (
                  <div key={`chef-img-${index}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-amber-200 bg-slate-100">
                    <img src={url} alt="" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-amber-500/90 py-0.5 text-center text-[10px] font-bold text-amber-950">
                        Principale
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      {index > 0 && (
                        <button type="button" onClick={() => setPrimaryChefImage(index)} className="rounded-lg bg-white p-1.5 text-xs font-bold text-slate-800" title="Définir comme principale">
                          <Star size={13} />
                        </button>
                      )}
                      <button type="button" onClick={() => removeChefImage(index)} className="rounded-lg bg-red-500 p-1.5 text-white hover:bg-red-600" aria-label="Supprimer">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-700/70">Aucune photo — JPEG, PNG, WebP ou GIF · max 5 Mo</p>
            )}
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          </section>

          {/* ── Section 4 : Slider ── */}
          <section className="space-y-4 rounded-2xl border border-amber-100 bg-white/70 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              <ListOrdered size={12} className="inline mr-1.5" />Slider de la page d&apos;accueil
            </p>

            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
              <p className="text-sm text-amber-800">
                {form.show_in_slider ? 'Apparaît dans le carousel' : 'Masquée du carousel'}
              </p>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, show_in_slider: !f.show_in_slider }))}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                  form.show_in_slider
                    ? 'border-amber-400 bg-amber-100 text-amber-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                {form.show_in_slider ? 'Affichée' : 'Masquée'}
              </button>
            </div>

            <div>
              {label('Image dédiée au slider (optionnel)')}
              <p className="mb-2 text-xs text-amber-700/70">Image détourée pour le bandeau. Si vide, la photo principale est utilisée.</p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 transition-colors hover:border-amber-500 hover:bg-amber-50">
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
                        const fd = new FormData()
                        fd.append('file', file)
                        const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-pin': getAdminPin(), 'x-csrf-token': getCsrfToken() }, body: fd })
                        const data = await res.json().catch(() => ({}))
                        if (res.ok && data.url) setForm(f => ({ ...f, slider_image_url: data.url }))
                        else setUploadError(data.error || 'Erreur upload')
                      } finally { setUploading(false); e.target.value = '' }
                    }}
                  />
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {form.slider_image_url ? 'Remplacer' : 'Ajouter'}
                </label>
                {form.slider_image_url && (
                  <div className="group relative h-20 w-28 overflow-hidden rounded-xl border-2 border-amber-200 bg-slate-100">
                    <img src={form.slider_image_url} alt="Slider" className="h-full w-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, slider_image_url: '' }))}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold text-white opacity-0 transition-opacity hover:opacity-100"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Erreur + bouton sauvegarder ── */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <X size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 text-base font-black text-amber-950 shadow-lg shadow-amber-300/40 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? <><Loader2 size={18} className="animate-spin" /> Mise à jour…</>
              : <><Save size={18} /> Sauvegarder la Pizza du Chef</>
            }
          </button>
        </div>
      )}
    </div>
  )
}
