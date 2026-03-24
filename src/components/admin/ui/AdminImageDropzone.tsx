'use client'

import { useRef, useState, useCallback } from 'react'
import { CloudUpload, ImageDown, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminFocusRing } from '@/components/admin/adminUi'

const ACCEPT_ATTR = 'image/jpeg,image/png,image/webp,image/gif'
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const DEFAULT_MAX = 5 * 1024 * 1024

function fileLooksAllowed(file: File): boolean {
  if (file.type && ALLOWED_TYPES.has(file.type)) return true
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name)
}

function inspectDragItems(e: React.DragEvent): 'accept' | 'reject' | 'idle' {
  const items = e.dataTransfer?.items
  if (!items?.length) return 'idle'
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (it.kind !== 'file') continue
    const t = it.type
    if (ALLOWED_TYPES.has(t)) return 'accept'
    if (!t) return 'idle'
    if (t.startsWith('image/')) return 'reject'
    return 'reject'
  }
  return 'idle'
}

export type AdminImageDropzoneProps = {
  /** Fichier déjà validé (type + taille) — le parent lance l’upload */
  onFile: (file: File) => void
  onValidationError?: (message: string) => void
  disabled?: boolean
  uploading?: boolean
  maxSizeBytes?: number
  /** Titre zone au repos */
  idleTitle: string
  /** Titre quand le fichier peut être déposé */
  acceptTitle?: string
  /** Titre quand le type est refusé */
  rejectTitle?: string
  hint?: string
  /** Texte du bouton secondaire (ouvre le sélecteur de fichiers) */
  browseLabel?: string
  className?: string
  compact?: boolean
}

export function AdminImageDropzone({
  onFile,
  onValidationError,
  disabled = false,
  uploading = false,
  maxSizeBytes = DEFAULT_MAX,
  idleTitle,
  acceptTitle = 'Déposez l’image ici',
  rejectTitle = 'Format image uniquement (JPEG, PNG, WebP, GIF)',
  hint = 'Glissez-déposez une image ou utilisez le bouton. Max 5 Mo.',
  browseLabel = 'Parcourir les fichiers',
  className,
  compact = false,
}: AdminImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [zone, setZone] = useState<'idle' | 'accept' | 'reject'>('idle')
  const dragCounter = useRef(0)

  const validateAndEmit = useCallback(
    (file: File) => {
      if (!fileLooksAllowed(file)) {
        onValidationError?.('Choisissez une image (JPEG, PNG, WebP, GIF).')
        return
      }
      if (file.size > maxSizeBytes) {
        onValidationError?.('Image trop lourde (max 5 Mo).')
        return
      }
      onFile(file)
    },
    [maxSizeBytes, onFile, onValidationError]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndEmit(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setZone('idle')
    if (disabled || uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndEmit(file)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled || uploading) return
    dragCounter.current += 1
    setZone(inspectDragItems(e))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled || uploading) return
    const z = inspectDragItems(e)
    e.dataTransfer.dropEffect = z === 'reject' ? 'none' : 'copy'
    setZone(z)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setZone('idle')
    }
  }

  const openPicker = () => inputRef.current?.click()

  const busy = disabled || uploading

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        onKeyDown={(e) => {
          if (busy) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        onClick={() => !busy && openPicker()}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200',
          compact ? 'px-4 py-6' : 'px-5 py-10',
          busy && 'cursor-not-allowed opacity-70',
          zone === 'idle' &&
            'border-slate-200 bg-slate-50/50 hover:border-coral/40 hover:bg-coral/[0.06]',
          zone === 'accept' && 'border-coral bg-coral/10 ring-2 ring-coral/25',
          zone === 'reject' && 'border-red-300 bg-red-50/80 ring-2 ring-red-200/60',
          adminFocusRing
        )}
        aria-label={idleTitle}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          disabled={busy}
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="pointer-events-none flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-coral" aria-hidden />
            ) : zone === 'accept' ? (
              <ImageDown className="h-8 w-8 text-coral" strokeWidth={1.5} aria-hidden />
            ) : zone === 'reject' ? (
              <X className="h-8 w-8 text-red-500" strokeWidth={1.5} aria-hidden />
            ) : (
              <CloudUpload className="h-8 w-8 text-coral" strokeWidth={1.5} aria-hidden />
            )}
          </div>

          <p className="text-base font-bold text-slate-800">
            {uploading ? 'Envoi en cours…' : zone === 'accept' ? acceptTitle : zone === 'reject' ? rejectTitle : idleTitle}
          </p>

          {hint && !uploading && (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{hint}</p>
          )}
        </div>
      </div>

      {browseLabel && (
        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation()
            openPicker()
          }}
          className={cn(
            'mx-auto min-h-[44px] rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-coral/40 hover:bg-coral/5 hover:text-coral disabled:opacity-50',
            adminFocusRing
          )}
        >
          {browseLabel}
        </button>
      )}
    </div>
  )
}
