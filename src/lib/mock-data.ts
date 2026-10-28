import type { Account, Transaction, ProcessTransactionPayload, TransferPayload, TransactionFilters, PaginatedResult } from '@/types'
import type { CreateAccountInput } from './schemas'
import { formatCleanReferenceId } from './reference'

const STORAGE_KEY_ACCOUNTS = 'emerald_wealth_inr_accounts_acmm_v11'
const STORAGE_KEY_TRANSACTIONS = 'emerald_wealth_inr_transactions_acmm_v11'

// Unguessable alphanumeric charset (excludes confusing 0/O, 1/I)
const ALPHANUMERIC_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

/**
 * Generates an 8-character account ID following Option 1:
 * AC + [2-digit Month] + [4-char Random Alphanumeric] (e.g. AC107K9P)
 */
export function generate8CharId(existingAccounts?: Account[]): string {
  const accounts = existingAccounts || getStoredAccounts()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  let id: string
  do {
    let randomPart = ''
    for (let i = 0; i < 4; i++) {
      randomPart += ALPHANUMERIC_CHARS.charAt(Math.floor(Math.random() * ALPHANUMERIC_CHARS.length))
    }
    id = `AC${month}${randomPart}`
  } while (accounts.some((a) => a.id === id))
  return id
}

// Initial clean seed accounts with 8-character ACmmXXXX IDs
const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'AC107K9P',
    name: 'Operating Treasury',
    balance: 1000.0,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'AC103X8D',
    name: 'Strategic Investment Reserve',
    balance: 500.0,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'AC109M2B',
    name: 'New Corporate Escrow',
    balance: 0.0,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
]

// Initial clean transactions: INTTXNXXXXXX (internal) and OTHERACCXXXXXXdr/cr (transfers)
const INITIAL_TRANSACTIONS: Transaction[] = [
  // ─── Operating Treasury (AC107K9P) - Balance: ₹1,000.00 (6 records -> Page 1 of 2) ───
  {
    id: 'tx-1001',
    account_id: 'AC107K9P',
    type: 'credit',
    amount: 1000.0,
    description: 'Initial Capital Injection',
    reference_id: 'INTTXN101001',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'tx-1002',
    account_id: 'AC107K9P',
    type: 'debit',
    amount: 300.0,
    description: 'Transfer to Strategic Investment Reserve',
    reference_id: 'OTHERACC201001dr',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'tx-1003',
    account_id: 'AC107K9P',
    type: 'credit',
    amount: 500.0,
    description: 'Corporate Client Retainer',
    reference_id: 'INTTXN101002',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'tx-1004',
    account_id: 'AC107K9P',
    type: 'debit',
    amount: 200.0,
    description: 'Transfer to New Corporate Escrow',
    reference_id: 'OTHERACC202001dr',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'tx-1005',
    account_id: 'AC107K9P',
    type: 'debit',
    amount: 100.0,
    description: 'Server Infrastructure Maintenance',
    reference_id: 'INTTXN101003',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'tx-1006',
    account_id: 'AC107K9P',
    type: 'credit',
    amount: 100.0,
    description: 'Treasury Advisory Settlement',
    reference_id: 'INTTXN101004',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },

  // ─── Strategic Investment Reserve (AC103X8D) - Balance: ₹500.00 ───
  {
    id: 'tx-2001',
    account_id: 'AC103X8D',
    type: 'credit',
    amount: 300.0,
    description: 'Transfer from Operating Treasury',
    reference_id: 'OTHERACC201001cr',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'tx-2002',
    account_id: 'AC103X8D',
    type: 'credit',
    amount: 200.0,
    description: 'Strategic Dividend Allocation',
    reference_id: 'INTTXN201001',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },

  // ─── New Corporate Escrow (AC109M2B) - Balance: ₹0.00 ───
  {
    id: 'tx-3001',
    account_id: 'AC109M2B',
    type: 'credit',
    amount: 200.0,
    description: 'Transfer from Operating Treasury',
    reference_id: 'OTHERACC202001cr',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'tx-3002',
    account_id: 'AC109M2B',
    type: 'debit',
    amount: 200.0,
    description: 'Vendor Milestone Settlement',
    reference_id: 'INTTXN301001',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

function getStoredAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS))
      return INITIAL_ACCOUNTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_ACCOUNTS
  }
}

function saveAccounts(accounts: Account[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts))
  } catch {}
}

function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS))
      return INITIAL_TRANSACTIONS
    }
    const parsed: Transaction[] = JSON.parse(raw)
    let hasDirty = false
    const sanitized = parsed.map((t) => {
      const cleanRef = formatCleanReferenceId(t.reference_id)
      if (cleanRef !== t.reference_id) {
        hasDirty = true
        return { ...t, reference_id: cleanRef }
      }
      return t
    })
    if (hasDirty) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(sanitized))
    }
    return sanitized
  } catch {
    return INITIAL_TRANSACTIONS
  }
}

function saveTransactions(txs: Transaction[]) {
  try {
    const cleanTxs = txs.map((t) => ({
      ...t,
      reference_id: formatCleanReferenceId(t.reference_id),
    }))
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(cleanTxs))
  } catch {}
}

export const mockAccountsService = {
  async getAll(): Promise<Account[]> {
    return getStoredAccounts()
  },

  async getById(id: string): Promise<Account> {
    const accounts = getStoredAccounts()
    const found = accounts.find((a) => a.id.toUpperCase() === id.toUpperCase())
    if (!found) {
      const err = new Error(`Account not found: No account exists with ID '${id}'`)
      ;(err as any).code = 'PGRST116'
      ;(err as any).status = 404
      throw err
    }
    return found
  },

  async create(data: CreateAccountInput): Promise<Account> {
    const accounts = getStoredAccounts()
    const newAccount: Account = {
      id: generate8CharId(accounts), // Unidentifiable 8-char alphanumeric identifier
      name: data.name.trim(),
      balance: 0, // Initial balance must always be 0
      created_at: new Date().toISOString(),
    }
    accounts.unshift(newAccount)
    saveAccounts(accounts)
    return newAccount
  },
}

export const mockTransactionsService = {
  async process(payload: ProcessTransactionPayload): Promise<Transaction> {
    const accounts = getStoredAccounts()
    const txs = getStoredTransactions()

    const accountIndex = accounts.findIndex((a) => a.id === payload.p_account_id)
    if (accountIndex === -1) {
      const err = new Error('Invalid account ID')
      ;(err as any).code = '23503'
      throw err
    }

    // Check unique reference_id (Idempotency)
    const duplicate = txs.some(
      (t) => t.account_id === payload.p_account_id && t.reference_id === payload.p_reference_id
    )
    if (duplicate) {
      const err = new Error('Duplicate transaction: reference ID already exists')
      ;(err as any).code = '23505'
      throw err
    }

    const currentBalance = Number(accounts[accountIndex].balance)
    const amount = Number(payload.p_amount)

    if (amount <= 0) {
      const err = new Error('Amount must be positive')
      ;(err as any).code = '23514'
      throw err
    }

    let newBalance = currentBalance
    if (payload.p_type === 'credit') {
      newBalance = currentBalance + amount
    } else if (payload.p_type === 'debit') {
      if (currentBalance - amount < 0) {
        const err = new Error('CHECK constraint failed: balance cannot be negative')
        ;(err as any).code = '23514'
        throw err
      }
      newBalance = currentBalance - amount
    } else {
      const err = new Error('Invalid transaction type')
      ;(err as any).code = '22023'
      throw err
    }

    // Atomic update
    accounts[accountIndex].balance = newBalance
    saveAccounts(accounts)

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      account_id: payload.p_account_id,
      type: payload.p_type,
      amount,
      description: payload.p_description ?? null,
      reference_id: formatCleanReferenceId(payload.p_reference_id),
      created_at: new Date().toISOString(),
    }
    txs.unshift(newTx)
    saveTransactions(txs)

    return newTx
  },

  async transfer(payload: TransferPayload): Promise<{ status: string; reference_id: string; amount: number }> {
    if (payload.source_account_id === payload.dest_account_id) {
      const err = new Error('Source and destination accounts must be different')
      ;(err as any).code = '22023'
      throw err
    }

    // Atomic: debit source
    await mockTransactionsService.process({
      p_account_id: payload.source_account_id,
      p_type: 'debit',
      p_amount: payload.amount,
      p_description: payload.description || `Transfer to account #${payload.dest_account_id}`,
      p_reference_id: `${payload.reference_id}dr`,
    })

    // Atomic: credit destination
    await mockTransactionsService.process({
      p_account_id: payload.dest_account_id,
      p_type: 'credit',
      p_amount: payload.amount,
      p_description: payload.description || `Transfer from account #${payload.source_account_id}`,
      p_reference_id: `${payload.reference_id}cr`,
    })

    return {
      status: 'success',
      reference_id: payload.reference_id,
      amount: payload.amount,
    }
  },

  async getByAccount(accountId: string, filters: TransactionFilters): Promise<PaginatedResult<Transaction>> {
    const txs = getStoredTransactions()
    let filtered = txs.filter((t) => t.account_id === accountId)

    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type)
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const totalRecords = filtered.length
    const limit = filters.limit ?? filters.pageSize ?? 5
    const page = filters.page && filters.page >= 1 ? Number(filters.page) : 1

    const from = (page - 1) * limit
    const paged = filtered.slice(from, from + limit)
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit))

    return {
      data: paged,
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
