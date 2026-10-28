import { useToast } from '@/components/ui/toast'
import { useCallback } from 'react'

export function useToastNotify() {
  const { addToast } = useToast()

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: 'success' })
    },
    [addToast]
  )

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: 'error' })
    },
    [addToast]
  )

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: 'info' })
    },
    [addToast]
  )

  return { success, error, info }
}
