'use client'

import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  useEffect(() => {
    if (open) {
      cancelButtonRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-[340px] z-10">
        <h2 id="confirm-dialog-title" className="text-base font-bold text-[#111] mb-2">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="text-sm text-[#555] whitespace-pre-line mb-6">{description}</p>
        <div className="flex gap-2 justify-end">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-[#555] border border-[#e5e5e5] rounded-xl hover:bg-[#f8f8f8] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
              variant === 'destructive'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#111] text-white hover:bg-[#333]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
