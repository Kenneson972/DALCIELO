'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Download, Edit2, Trash2, X, Loader2, Users, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminCard, adminFocusRing } from '@/components/admin/adminUi'
import { getCsrfToken } from '@/lib/csrf'
import { useAdminToast } from '@/components/admin/AdminToast'

interface Client {
  id: string
  nom: string
  prenom: string
  phone: string
  pizza_habituelle?: string | null
  fidelity_points: number
  notes?: string | null
  created_at: string
}

const EMPTY_FORM = { nom: '', prenom: '', phone: '', pizza_habituelle: '', fidelity_points: 0, notes: '' }

function getAdminPin(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_pin') || sessionStorage.getItem('admin_pin') || ''
}

export function ClientsManager() {
  const { showToast } = useAdminToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadClients = useCallback(async () => {
    const pin = getAdminPin()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/clients', { headers: { 'x-admin-pin': pin } })
      const data = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(data.clients)) {
        setClients(data.clients)
      } else {
        setError(data.error || 'Impossible de charger les clients.')
        setClients([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadClients() }, [loadClients])

  const openCreate = () => {
    setEditingClient(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setForm({
      nom: client.nom,
      prenom: client.prenom,
      phone: client.phone,
      pizza_habituelle: client.pizza_habituelle ?? '',
      fidelity_points: client.fidelity_points,
      notes: client.notes ?? '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pin = getAdminPin()
    setSaving(true)
    try {
      const url = editingClient ? `/api/admin/clients/${editingClient.id}` : '/api/admin/clients'
      const method = editingClient ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin, 'x-csrf-token': getCsrfToken() },
        body: JSON.stringify({
          ...form,
          fidelity_points: Number(form.fidelity_points) || 0,
          pizza_habituelle: form.pizza_habituelle || null,
          notes: form.notes || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        showToast('success', editingClient ? 'Client modifié' : 'Client ajouté')
        setShowForm(false)
        await loadClients()
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`Supprimer ${client.prenom} ${client.nom} ?`)) return
    const pin = getAdminPin()
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin, 'x-csrf-token': getCsrfToken() },
      })
      if (res.ok) {
        showToast('success', 'Client supprimé')
        await loadClients()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur réseau')
    }
  }

  const handleExport = async () => {
    const pin = getAdminPin()
    setExporting(true)
    try {
      const res = await fetch('/api/admin/clients/export', { headers: { 'x-admin-pin': pin } })
      if (!res.ok) { setError('Erreur export'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      a.download = `clients_${dateStr}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const filtered = clients.filter(c =>
    [c.nom, c.prenom, c.phone].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-coral" aria-label="Chargement" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:space-y-8">
      {/* Header */}
      <div className={cn(adminCard, 'flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6')}>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Clients & Fidélité</h2>
          <p className="mt-1 text-sm text-slate-600">{clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden />
            <input
              type="text"
              placeholder="Rechercher…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn('w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400', adminFocusRing, 'focus:border-coral')}
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || clients.length === 0}
            className={cn('inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-100 px-4 font-semibold text-slate-800 transition-colors hover:bg-slate-200 disabled:opacity-50', adminFocusRing)}
          >
            <Download size={18} aria-hidden />
            {exporting ? 'Export…' : 'Exporter CSV'}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className={cn('inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-coral to-burnt-orange px-4 font-semibold text-white shadow-md shadow-coral/20 transition hover:brightness-[1.03]', adminFocusRing)}
          >
            <Plus size={18} aria-hidden /> Ajouter un client
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 flex items-center gap-3">
          <AlertTriangle size={20} aria-hidden />
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={cn(adminCard, 'space-y-4 border-slate-200 shadow-md animate-in fade-in slide-in-from-top-4')}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-900">{editingClient ? 'Modifier le client' : 'Nouveau client'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={24} aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([['prenom', 'Prénom *', 'text'], ['nom', 'Nom *', 'text'], ['phone', 'Téléphone *', 'tel']] as const).map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pizza habituelle</label>
              <input
                type="text"
                value={form.pizza_habituelle}
                onChange={(e) => setForm(p => ({ ...p, pizza_habituelle: e.target.value }))}
                placeholder="ex: Margherita"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Points fidélité</label>
              <input
                type="number"
                min={0}
                value={form.fidelity_points}
                onChange={(e) => setForm(p => ({ ...p, fidelity_points: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Allergies, préférences…"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-coral/20 focus:border-coral outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Annuler</button>
            <button type="submit" disabled={saving} className="bg-coral text-white px-6 py-2 rounded-lg font-bold hover:bg-burnt-orange shadow-lg shadow-coral/20 disabled:opacity-50">
              {saving ? 'Sauvegarde…' : editingClient ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {clients.length === 0 && !showForm ? (
        <div className={cn(adminCard, 'p-10 text-center md:p-12')}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Users className="text-slate-400" size={32} aria-hidden />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun client</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Ajoutez vos premiers clients fidèles pour commencer à suivre leur historique.</p>
          <button onClick={openCreate} className="bg-coral text-white px-6 py-3 rounded-xl font-bold hover:bg-burnt-orange shadow-lg shadow-coral/25 transition-all hover:scale-105">
            Ajouter un client
          </button>
        </div>
      ) : filtered.length === 0 && searchTerm ? (
        <div className={cn(adminCard, 'p-8 text-center text-slate-500')}>
          Aucun résultat pour « {searchTerm} »
        </div>
      ) : (
        <div className={cn(adminCard, 'overflow-hidden p-0')}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {['Prénom / Nom', 'Téléphone', 'Pizza habituelle', 'Points', 'Notes', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.prenom} {c.nom}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{c.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{c.pizza_habituelle || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                        {c.fidelity_points} pts
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{c.notes || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-coral hover:bg-coral/10 transition-colors"
                          aria-label={`Modifier ${c.prenom} ${c.nom}`}
                        >
                          <Edit2 size={16} aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label={`Supprimer ${c.prenom} ${c.nom}`}
                        >
                          <Trash2 size={16} aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
