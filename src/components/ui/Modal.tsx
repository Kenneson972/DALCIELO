'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // ESC key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
      // Auto-focus the modal
      requestAnimationFrame(() => {
        modalRef.current?.focus()
      })
    } else {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
      // Restore previous focus
      previousFocusRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden outline-none",
              className
            )}
          >
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <h3 className="text-2xl font-black">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cream rounded-full transition-colors text-gray-400 hover:text-primary"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
