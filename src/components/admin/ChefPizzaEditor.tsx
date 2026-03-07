'use client'

import { useState } from 'react'
import { generateSlug } from '@/lib/utils'
import { Sparkles, Save, Loader2, Calendar, X, Upload } from 'lucide-react'
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
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-pin': getAdminPin() }, body: formData })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) setForm(f => ({ ...f, image_urls: [...f.image_urls, data.url] }))
      else setUploadError(data.error || 'Erreur d’upload')
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
    setSuccess(false)
    try {
      const name = form.name.trim()
      const slug = generateSlug(name) || 'pizza-du-chef'
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': getAdminPin() },
        body: JSON.stringify({
          name:             name,
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
      setSuccess(true)
      onUpdated(data.product)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-3xl p-6 md:p-8 shadow-lg">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl shadow">
            🌟
          </div>
          <div>
            <h2 className="text-xl font-black text-yellow-900">Pizza du Chef</h2>
            <p className="text-sm text-yellow-700">
              Éphémère · change tous les 15 jours
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
          daysSinceUpdate > 14
            ? 'bg-red-100 text-red-700'
            : daysSinceUpdate > 10
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'
        }`}>
          <Calendar size={14} />
          Mise à jour il y a {daysSinceUpdate} jour{daysSinceUpdate > 1 ? 's' : ''}
          {daysSinceUpdate > 14 && ' — À renouveler !'}
        </div>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nom */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1.5">
            Nom de la création *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="ex. Royale Antillaise, Chorizo Créole…"
            className="w-full px-4 py-3 bg-white border-2 border-yellow-300 rounded-2xl focus:outline-none focus:border-yellow-500 text-slate-900 font-semibold text-lg placeholder:text-slate-300"
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1.5">
            Prix (€) *
          </label>
          <input
            type="number"
            min={5}
            step={0.5}
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
            className="w-full px-4 py-3 bg-white border-2 border-yellow-300 rounded-2xl focus:outline-none focus:border-yellow-500 text-slate-900 font-bold text-xl"
          />
        </div>

        {/* Valable jusqu'au */}
        <div>
          <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1.5">
            Valable jusqu'au
          </label>
          <input
            type="date"
            value={form.chef_valid_until}
            onChange={e => setForm(f => ({ ...f, chef_valid_until: e.target.value }))}
            className="w-full px-4 py-3 bg-white border-2 border-yellow-300 rounded-2xl focus:outline-none focus:border-yellow-500 text-slate-700"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1.5">
            Description (affichée au client)
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Décrivez les saveurs, l'inspiration…"
            className="w-full px-4 py-3 bg-white border-2 border-yellow-300 rounded-2xl focus:outline-none focus:border-yellow-500 text-slate-700 resize-none"
          />
        </div>

        {/* Ingrédients */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1.5">
            Ingrédients (un par ligne)
          </label>
          <textarea
            rows={4}
            value={form.ingredients}
            onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
            placeholder={"Base tomate\nMozzarella\nEmmental\nPoulet colombo\nOignon rouge"}
            className="w-full px-4 py-3 bg-white border-2 border-yellow-300 rounded-2xl focus:outline-none focus:border-yellow-500 text-slate-700 resize-none font-mono text-sm"
          />
        </div>

        {/* Photos (galerie comme les autres pizzas) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1.5">
            Photos (la 1re = principale)
          </label>
          <p className="text-xs text-yellow-700 mb-2">Ajoutez plusieurs images. La première est affichée en principal sur la fiche produit.</p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-yellow-300 rounded-2xl cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-yellow-900 font-semibold">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={handleImageUpload} />
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              {uploading ? 'Upload…' : 'Ajouter une image'}
            </label>
            <div className="flex flex-wrap gap-2">
              {form.image_urls.map((url, index) => (
                <div key={`chef-img-${index}`} className="relative group w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border-2 border-yellow-200">
                  <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-yellow-500/90 text-yellow-900 text-[10px] font-bold text-center py-0.5">Principale</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {index > 0 && (
                      <button type="button" onClick={() => setPrimaryChefImage(index)} className="p-1.5 bg-white rounded-lg text-xs font-bold text-slate-800" title="Définir comme principale">★</button>
                    )}
                    <button type="button" onClick={() => removeChefImage(index)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600" aria-label="Supprimer">
                      <X size={14} />
                    </button>
                  </div>
              </div>
              ))}
            </div>
          </div>
          {uploadError && <p className="mt-1.5 text-sm text-red-600">{uploadError}</p>}
          {form.image_urls.length === 0 && <p className="mt-1 text-xs text-yellow-700">JPEG, PNG, WebP ou GIF — max 5 Mo</p>}
        </div>

        {/* Slider page d'accueil */}
        <div className="md:col-span-2 border-t border-yellow-200 pt-5 mt-2">
          <label className="block text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1.5">
            Slider de la page d&apos;accueil
          </label>
          <p className="text-xs text-yellow-700 mb-3">Cette pizza peut apparaître dans le carousel de la home. Désactivez pour la masquer.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, show_in_slider: !f.show_in_slider }))}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl border-2 font-semibold text-sm transition-colors ${
                form.show_in_slider
                  ? 'border-yellow-500 bg-yellow-100 text-yellow-900'
                  : 'border-slate-300 bg-white text-slate-500'
              }`}
            >
              {form.show_in_slider ? 'Affichée dans le slider' : 'Masquée du slider'}
            </button>
            <span className="text-xs text-yellow-800">
              {form.show_in_slider ? 'La Pizza du Chef apparaît dans le carousel.' : "La Pizza du Chef n'apparaît pas dans le carousel."}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2">Image dédiée au slider (optionnel)</p>
            <p className="text-xs text-yellow-700 mb-2">Image pour le bandeau (ex. pizza détourée). Sinon la photo principale est utilisée.</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border-2 border-dashed border-yellow-300 rounded-xl cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-yellow-900 font-semibold text-sm">
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
                      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-pin': getAdminPin() }, body: fd })
                      const data = await res.json().catch(() => ({}))
                      if (res.ok && data.url) setForm(f => ({ ...f, slider_image_url: data.url }))
                      else setUploadError(data.error || 'Erreur upload')
                    } finally { setUploading(false); e.target.value = '' }
                  }}
                />
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {form.slider_image_url ? "Remplacer l'image slider" : 'Ajouter une image pour le slider'}
              </label>
              {form.slider_image_url && (
                <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-100 border-2 border-yellow-200">
                  <img src={form.slider_image_url} alt="Slider" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, slider_image_url: '' }))}
                    className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
          <X size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-semibold">
          ✅ Pizza du Chef mise à jour sur le site !
        </div>
      )}

      {/* Bouton */}
      <button
        onClick={handleSave}
        disabled={saving || !form.name.trim()}
        className="mt-5 w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-yellow-900 font-black text-lg py-4 rounded-2xl transition-colors shadow-lg shadow-yellow-400/30"
      >
        {saving
          ? <><Loader2 size={20} className="animate-spin" /> Mise à jour en cours…</>
          : <><Sparkles size={20} /> Mettre à jour la Pizza du Chef</>}
      </button>
    </div>
  )
}
