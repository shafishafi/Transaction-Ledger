import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '@/services/transactions'
import { mapSupabaseError } from '@/lib/error-map'
import { useToastNotify } from '@/hooks/use-toast-notify'
import { accountKeys } from '@/hooks/use-accounts'
import { formatINR } from '@/lib/currency'
import type { TransactionFilters, ProcessTransactionPayload, TransferPayload } from '@/types'

// ─── Query Keys ─────────────────────────────────────────────────
export const txKeys = {
  all:            () => ['transactions'] as const,
  byAccount:      (accountId: string) => ['transactions', accountId] as const,
  byAccountFiltered: (accountId: string, filters: TransactionFilters) =>
    ['transactions', accountId, filters] as const,
}

// ─── Queries ─────────────────────────────────────────────────────

export function useTransactions(accountId: string, filters: TransactionFilters) {
  return useQuery({
    queryKey: txKeys.byAccountFiltered(accountId, filters),
    queryFn:  () => transactionsService.getByAccount(accountId, filters),
    enabled:  !!accountId,
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  })
}

// ─── Mutations ───────────────────────────────────────────────────

export function useProcessTransaction(accountId: string) {
  const queryClient = useQueryClient()
  const notify = useToastNotify()

  return useMutation({
    mutationFn: (payload: ProcessTransactionPayload) =>
      transactionsService.process(payload),
    onSuccess: (_, variables) => {
      // Invalidate both the transaction list and the account balance
      queryClient.invalidateQueries({ queryKey: txKeys.byAccount(accountId) })
      queryClient.invalidateQueries({ queryKey: accountKeys.detail(accountId) })
      queryClient.invalidateQueries({ queryKey: accountKeys.all() })
      const verb = variables.p_type === 'credit' ? 'credited' : 'debited'
      notify.success(`Account ${verb} successfully.`)
    },
    onError: (err: { code?: string; message?: string }) => {
      notify.error(mapSupabaseError(err))
    },
  })
}

export function useTransfer() {
  const queryClient = useQueryClient()
  const notify = useToastNotify()

  return useMutation({
    mutationFn: (payload: TransferPayload) => transactionsService.transfer(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all() })
      queryClient.invalidateQueries({ queryKey: txKeys.all() })
      notify.success(`Transfer of ${formatINR(data.amount)} completed successfully.`)
    },
    onError: (err: { code?: string; message?: string }) => {
      notify.error(mapSupabaseError(err))
    },
  })
}

