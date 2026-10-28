import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsService } from '@/services/accounts'
import { mapSupabaseError } from '@/lib/error-map'
import { useToastNotify } from '@/hooks/use-toast-notify'
import type { CreateAccountInput } from '@/lib/schemas'

// ─── Query Keys ─────────────────────────────────────────────────
export const accountKeys = {
  all:    () => ['accounts'] as const,
  detail: (id: string) => ['accounts', id] as const,
}

// ─── Queries ─────────────────────────────────────────────────────

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all(),
    queryFn:  accountsService.getAll,
    staleTime: 30_000,
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn:  () => accountsService.getById(id),
    enabled:  !!id,
    staleTime: 15_000,
  })
}

// ─── Mutations ───────────────────────────────────────────────────

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const notify = useToastNotify()

  return useMutation({
    mutationFn: (data: CreateAccountInput) => accountsService.create(data),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all() })
      notify.success(`Account "${account.name}" created successfully.`)
    },
    onError: (err: { code?: string; message?: string }) => {
      notify.error(mapSupabaseError(err))
    },
  })
}

