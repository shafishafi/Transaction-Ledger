import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-[520px] bg-white rounded-2xl p-4 sm:p-6 card-shadow border border-[#f1f5f9] z-10 my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-start justify-between pb-3 border-b border-[#f3f4f6] shrink-0">
          <div className="pr-3">
            <h3 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs text-[#6b7280] mt-0.5 leading-snug">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827] p-1.5 rounded-xl hover:bg-[#f3f4f6] transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3.5 overflow-y-auto flex-1 pr-0.5">{children}</div>
      </div>
    </div>
  )
}
