import { supabase, isConfigured } from '@/lib/supabase'
import { mockTransactionsService } from '@/lib/mock-data'
import type { ProcessTransactionPayload, TransferPayload, TransactionFilters, Transaction, PaginatedResult } from '@/types'

export const transactionsService = {
  async process(payload: ProcessTransactionPayload): Promise<Transaction> {
    if (!isConfigured || !supabase) {
      return mockTransactionsService.process(payload)
    }

    const { data, error } = await supabase.rpc('process_transaction', {
      p_account_id:   payload.p_account_id,
      p_type:         payload.p_type,
      p_amount:       payload.p_amount,
      p_description:  payload.p_description ?? null,
      p_reference_id: payload.p_reference_id,
    })

    if (error) throw error
    return data as Transaction
  },

  async transfer(payload: TransferPayload): Promise<{ status: string; reference_id: string; amount: number }> {
    if (!isConfigured || !supabase) {
      return mockTransactionsService.transfer(payload)
    }

    const { data, error } = await supabase.rpc('transfer_funds', {
      source_account_id: payload.source_account_id,
      dest_account_id:   payload.dest_account_id,
      amount:            payload.amount,
      reference_id:      payload.reference_id,
    })

    if (error) throw error
    return data as { status: string; reference_id: string; amount: number }
  },

  async getByAccount(
    accountId: string,
    filters: TransactionFilters
  ): Promise<PaginatedResult<Transaction>> {
    const limit = filters.limit ?? filters.pageSize ?? 5
    const page = filters.page && filters.page >= 1 ? Number(filters.page) : 1

    if (!isConfigured || !supabase) {
      return mockTransactionsService.getByAccount(accountId, {
        ...filters,
        page,
        limit,
        pageSize: limit,
      })
    }

    const from = (page - 1) * limit
    const to   = from + limit - 1

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    const { data, count, error } = await query

    if (error) throw error

    const totalRecords = count ?? 0
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit))

    return {
      data: (data ?? []) as Transaction[],
      currentPage: page,
      page,
      pageSize: limit,
      limit,
      totalRecords,
      totalPages,
      count: totalRecords,
    }
  },
}
