import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ title, description, type }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, type }])
      setTimeout(() => {
        removeToast(id)
      }, 5000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function Toaster() {
  const context = useContext(ToastContext)
  if (!context) return null
  const { toasts, removeToast } = context

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col gap-2.5 w-[calc(100vw-2rem)] sm:w-full sm:max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl card-shadow border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              isSuccess
                ? 'bg-[#ffffff] border-[#8af5be] text-[#141b2b]'
                : isError
                ? 'bg-[#ffffff] border-[#ffdad6] text-[#141b2b]'
                : 'bg-[#ffffff] border-[#e5e7eb] text-[#141b2b]'
            }`}
          >
            <div className="flex gap-3 items-start">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#00875a] shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-[#006a4e] shrink-0 mt-0.5" />}
              <div>
                <p className="font-semibold text-sm leading-tight text-[#111827]">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-[#6b7280] mt-1 leading-normal">{toast.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6b7280] hover:text-[#111827] p-1 -mr-1 -mt-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

