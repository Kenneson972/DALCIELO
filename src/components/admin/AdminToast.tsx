'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  msg: string
}

interface AdminToastCtx {
  showToast: (type: ToastType, msg: string) => void
}

const AdminToastContext = createContext<AdminToastCtx | null>(null)

export function useAdminToast() {
  const ctx = useContext(AdminToastContext)
  if (!ctx) throw new Error('useAdminToast must be used inside AdminToastProvider')
  return ctx
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <Check size={16} className="shrink-0 text-emerald-600" />,
  error:   <AlertTriangle size={16} className="shrink-0 text-red-500" />,
  info:    <Info size={16} className="shrink-0 text-blue-500" />,
}

const STYLES: Record<ToastType, string> = {
  success: 'bg-white border-emerald-200 text-emerald-800 shadow-emerald-100/60',
  error:   'bg-white border-red-200 text-red-800 shadow-red-100/60',
  info:    'bg-white border-blue-200 text-blue-800 shadow-blue-100/60',
}

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const showToast = useCallback((type: ToastType, msg: string) => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, type, msg }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 md:right-6"
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex min-w-[240px] max-w-[360px] items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg ${STYLES[toast.type]}`}
            >
              {ICONS[toast.type]}
              <p className="flex-1 text-sm font-medium">{toast.msg}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="ml-1 shrink-0 rounded-lg p-0.5 opacity-50 transition-opacity hover:opacity-100"
                aria-label="Fermer"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AdminToastContext.Provider>
  )
}
