'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, Megaphone, X, Upload, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react'
import type { Popup, PopupType, DismissMode } from '@/types/popup'

function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
}

// ─── Type config ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<PopupType, { label: string; emoji: string; color: string; bg: string }> = {
  chef:  { label: 'Pizza du Chef', emoji: '🍕', color: '#E17B5F', bg: '#fff3ef' },
  promo: { label: 'Promo / Réduction', emoji: '🏷️', color: '#16a34a', bg: '#f0fdf4' },
  event: { label: 'Événement spécial', emoji: '🎉', color: '#6366f1', bg: '#eef2ff' },
  alert: { label: 'Fermeture / Retard', emoji: '⚠️', color: '#dc2626', bg: '#fef2f2' },
}

// ─── Mini popup preview ────────────────────────────────────────────────────────

function PopupPreview({ form }: { form: FormState }) {
  const cfg = TYPE_CONFIG[form.type]
  return (
    <div className="bg-slate-100 rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aperçu popup</p>
      <div className="rounded-xl overflow-hidden shadow-md max-w-[220px] mx-auto w-full" style={{ background: form.type === 'chef' ? '#110804' : form.type === 'promo' ? '#0a2e1a' : form.type === 'event' ? '#0f0c29' : '#1a0505' }}>
        {form.image_url && form.type !== 'alert' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.image_url} alt="" className="w-full h-28 object-cover" />
        )}
        <div className="p-3">
          {form.type === 'alert' && (
            <div className="flex justify-center mb-2">
              <span className="text-2xl">⚠️</span>
            </div>
          )}
          <span
            className="inline-block text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full mb-2"
            style={{ background: cfg.color, color: '#fff' }}
          >
            {cfg.emoji} {cfg.label}
          </span>
          <p className="font-bold text-sm truncate" style={{ color: form.type === 'chef' ? '#FFF8F0' : form.type === 'promo' ? '#f0fdf4' : form.type === 'event' ? '#eef2ff' : '#fff0f0' }}>
            {form.title || 'Titre du popup'}
          </p>
          {form.price && form.type === 'chef' && (
            <p className="text-base font-black mt-1" style={{ color: '#FFF8F0' }}>
              {parseFloat(form.price).toFixed(2)} €
            </p>
          )}
          {form.cta_label && (
            <div className="mt-2 w-full text-white text-[10px] font-bold py-1.5 rounded-lg text-center" style={{ background: cfg.color }}>
              {form.cta_label}
            </div>
          )}
          {!form.active && (
            <div className="mt-1 text-center text-[9px] font-bold text-slate-400">Désactivé</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Type badge ─────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: PopupType }) {
  const cfg = TYPE_CONFIG[type]
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  )
}

// ─── Form state ─────────────────────────────────────────────────────────────────

interface FormState {
  type: PopupType
  title: string
  subtitle: string
  message: string
  image_url: string
  cta_label: string
  cta_url: string
  price: string
  expires_at: string
  active: boolean
  dismiss_mode: DismissMode
  priority: string
}

const EMPTY_FORM: FormState = {
  type: 'chef',
  title: '',
  subtitle: '',
  message: '',
  image_url: '',
  cta_label: '',
  cta_url: '',
  price: '',
  expires_at: '',
  active: false,
  dismiss_mode: 'once_daily',
  priority: '0',
}

function popupToForm(p: Popup): FormState {
  return {
    type: p.type,
    title: p.title,
    subtitle: p.subtitle ?? '',
    message: p.message ?? '',
    image_url: p.image_url ?? '',
    cta_label: p.cta_label ?? '',
    cta_url: p.cta_url ?? '',
    price: p.price != null ? String(p.price) : '',
    expires_at: p.expires_at ?? '',
    active: p.active,
    dismiss_mode: p.dismiss_mode,
    priority: String(p.priority),
  }
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function AnnouncementEditor() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const loadPopups = () => {
    const pin = getAdminPin()
    setLoading(true)
    fetch('/api/admin/popups', { headers: { 'x-admin-pin': pin } })
      .then((r) => r.json())
      .then(({ popups: list }: { popups: Popup[] }) => setPopups(list ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPopups() }, [])

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // alert → once_session forced
      if (key === 'type' && value === 'alert') next.dismiss_mode = 'once_session'
      if (key === 'type' && value !== 'alert' && prev.dismiss_mode === 'once_session') next.dismiss_mode = 'once_daily'
      return next
    })

  const openNew = () => {
    setForm(EMPTY_FORM)
    setFormError(null)
    setUploadError(null)
    setEditingId('new')
  }

  const openEdit = (p: Popup) => {
    setForm(popupToForm(p))
    setFormError(null)
    setUploadError(null)
    setEditingId(p.id)
  }

  const closeForm = () => setEditingId(null)

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Le titre est requis.'); return }
    setSaving(true)
    setFormError(null)

    const pin = getAdminPin()
    const payload = {
      type: form.type,
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      message: form.message.trim() || null,
      image_url: form.image_url.trim() || null,
      cta_label: form.cta_label.trim() || null,
      cta_url: form.cta_url.trim() || null,
      price: form.type === 'chef' && form.price ? parseFloat(form.price) : null,
      expires_at: form.expires_at || null,
      active: form.active,
      dismiss_mode: form.type === 'alert' ? 'once_session' : form.dismiss_mode,
      priority: parseInt(form.priority) || 0,
    }

    try {
      const isNew = editingId === 'new'
      const res = await fetch(
        isNew ? '/api/admin/popups' : `/api/admin/popups/${editingId}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur serveur')
      }
      showToast('success', isNew ? 'Popup créé !' : 'Popup mis à jour !')
      closeForm()
      loadPopups()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce popup ?')) return
    setDeleting(id)
    const pin = getAdminPin()
    try {
      await fetch(`/api/admin/popups/${id}`, { method: 'DELETE', headers: { 'x-admin-pin': pin } })
      showToast('success', 'Popup supprimé.')
      loadPopups()
      if (editingId === id) closeForm()
    } catch {
      showToast('error', 'Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (p: Popup) => {
    const pin = getAdminPin()
    try {
      const res = await fetch(`/api/admin/popups/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ active: !p.active }),
      })
      if (!res.ok) throw new Error()
      loadPopups()
    } catch {
      showToast('error', 'Erreur lors du changement de statut')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setUploadError(file.size > 5 * 1024 * 1024 ? 'Image trop lourde (max 5 Mo).' : 'Choisissez une image.')
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-pin': getAdminPin() }, body: formData })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) set('image_url', data.url)
      else setUploadError(data.error || "Erreur d'upload")
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        Chargement…
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-coral/10 rounded-xl">
            <Megaphone className="text-coral" size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Popups Annonce</h3>
            <p className="text-sm text-slate-500">Le popup actif avec la priorité la plus basse s&apos;affiche sur la homepage</p>
          </div>
        </div>
        {editingId === null && (
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 bg-coral text-white font-bold px-4 py-2.5 rounded-xl hover:bg-coral/90 active:scale-95 transition-all shadow-lg shadow-coral/20 text-sm"
          >
            <Plus size={16} />
            Nouveau popup
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toast.type === 'success' ? <Check size={16} className="shrink-0 text-green-600" /> : <X size={16} className="shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Form */}
      {editingId !== null && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <p className="font-bold text-slate-800">{editingId === 'new' ? 'Nouveau popup' : 'Modifier le popup'}</p>
            <button onClick={closeForm} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          <div className="grid lg:grid-cols-[1fr_260px] gap-6 p-6">
            <div className="space-y-5">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type de popup</label>
                <div className="relative">
                  <select
                    value={form.type}
                    onChange={(e) => set('type', e.target.value as PopupType)}
                    className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 text-sm transition-all bg-white pr-10"
                  >
                    {(Object.entries(TYPE_CONFIG) as [PopupType, typeof TYPE_CONFIG.chef][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {v.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Active + Priority */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Popup active</p>
                    <p className="text-xs text-slate-500 mt-0.5">Visible sur la homepage</p>
                  </div>
                  <button
                    onClick={() => set('active', !form.active)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-coral' : 'bg-slate-300'}`}
                    aria-label="Toggle active"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">Priorité</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => set('priority', e.target.value)}
                    min="0"
                    className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:border-coral"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 text-sm transition-all"
                  placeholder="Ex : La Volcanique du Mois"
                />
              </div>

              {/* Subtitle (not alert) */}
              {form.type !== 'alert' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {form.type === 'chef' ? 'Badge (ex: Édition Limitée)' : form.type === 'promo' ? 'Badge promo (ex: PROMO -15%)' : 'Sous-titre événement'}
                  </label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => set('subtitle', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 text-sm transition-all"
                    placeholder={form.type === 'chef' ? 'Édition Limitée' : form.type === 'promo' ? 'PROMO -15%' : 'Soirée Pizza & Jazz'}
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message / Description</label>
                <textarea
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 text-sm resize-none transition-all"
                  placeholder={form.type === 'alert' ? 'Ex : Nous sommes fermés ce soir pour maintenance. Reprise demain.' : 'Ex : Tomates cerises, mozzarella de bufflonne, basilic frais…'}
                />
              </div>

              {/* Price (chef only) */}
              {form.type === 'chef' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix €</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 text-sm transition-all"
                    placeholder="12.50"
                  />
                </div>
              )}

              {/* Image (not alert) */}
              {form.type !== 'alert' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Image popup</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-coral/50 hover:bg-coral/5 transition-colors text-slate-600 font-semibold text-sm">
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={handleImageUpload} />
                      {uploading ? <Loader2 size={18} className="animate-spin text-coral" /> : <Upload size={18} className="text-coral" />}
                      {uploading ? 'Upload…' : 'Choisir une image'}
                    </label>
                    {form.image_url && (
                      <div className="relative flex-1 min-h-[72px] rounded-xl overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.image_url} alt="Aperçu" className="w-full h-20 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        <button type="button" onClick={() => set('image_url', '')} className="absolute top-1 right-1 p-1.5 bg-slate-800/80 text-white rounded-lg hover:bg-slate-800" aria-label="Supprimer l'image">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  {uploadError && <p className="mt-1.5 text-sm text-red-600">{uploadError}</p>}
                </div>
              )}

              {/* CTA + URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bouton CTA (label)</label>
                  <input
                    type="text"
                    value={form.cta_label}
                    onChange={(e) => set('cta_label', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 text-sm transition-all"
                    placeholder={form.type === 'alert' ? 'Compris' : 'Découvrir'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL du CTA</label>
                  <input
                    type="text"
                    value={form.cta_url}
                    onChange={(e) => set('cta_url', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 text-sm transition-all"
                    placeholder="/menu/supreme"
                    disabled={form.type === 'alert'}
                  />
                </div>
              </div>

              {/* Expires at + dismiss mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {form.type === 'event' ? "Date de l'événement" : "Valable jusqu'au"}
                  </label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => set('expires_at', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/15 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dismiss</label>
                  <div className="relative">
                    <select
                      value={form.dismiss_mode}
                      disabled={form.type === 'alert'}
                      onChange={(e) => set('dismiss_mode', e.target.value as DismissMode)}
                      className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-coral text-sm bg-white pr-8 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="once_daily">1 fois / jour</option>
                      <option value="once_session">1 fois / session</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {form.type === 'alert' && (
                    <p className="text-[10px] text-slate-400 mt-1">Forcé : par session (alert)</p>
                  )}
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <X size={16} className="shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-coral text-white font-bold px-6 py-3 rounded-xl hover:bg-coral/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-coral/20 text-sm"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={closeForm} className="px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                  Annuler
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="hidden lg:block">
              <PopupPreview form={form} />
            </div>
          </div>
        </div>
      )}

      {/* Popup list */}
      {popups.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center">
          <div className="text-5xl mb-4">📢</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun popup créé</h3>
          <p className="text-slate-500 text-sm">Cliquez sur &quot;Nouveau popup&quot; pour créer votre première annonce.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Titre</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actif</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Priorité</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popups.map((p) => (
                <tr key={p.id} className={`transition-colors hover:bg-slate-50 ${editingId === p.id ? 'bg-coral/5' : ''}`}>
                  <td className="px-5 py-3.5">
                    <TypeBadge type={p.type} />
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800 text-sm max-w-[200px] truncate">
                    {p.title}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${p.active ? 'bg-coral' : 'bg-slate-300'}`}
                      aria-label={p.active ? 'Désactiver' : 'Activer'}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-center text-sm text-slate-500 font-mono">
                    {p.priority}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                        aria-label="Modifier"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600 disabled:opacity-50"
                        aria-label="Supprimer"
                      >
                        {deleting === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
