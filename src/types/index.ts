// Domain types for Transaction Ledger System

export type Account = {
  id: string
  name: string
  balance: number
  created_at: string
}

export type Transaction = {
  id: string
  account_id: string
  type: 'credit' | 'debit'
  amount: number
  description?: string | null
  reference_id: string
  created_at: string
}

export type TransactionFilters = {
  type?: 'credit' | 'debit'
  page?: number
  pageSize?: number
  limit?: number
}

export type ProcessTransactionPayload = {
  p_account_id: string
  p_type: 'credit' | 'debit'
  p_amount: number
  p_description?: string
  p_reference_id: string
}

export type TransferPayload = {
  source_account_id: string
  dest_account_id: string
  amount: number
  reference_id: string
  description?: string
}

export type PaginatedResult<T> = {
  data: T[]
  currentPage: number
  pageSize: number
  limit: number
  totalRecords: number
  totalPages: number
  count: number | null
  page: number
}

