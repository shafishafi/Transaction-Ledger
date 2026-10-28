import { create } from 'zustand'

export type CompletionModalData = {
  status?: 'success' | 'failed'
  errorMessage?: string
  currentBalance?: number
} & (
  | {
      type: 'transaction'
      title: string
      amount: number
      txType: 'credit' | 'debit'
      accountName?: string
      accountId: string
      referenceId: string
      description?: string
      timestamp: string
    }
  | {
      type: 'transfer'
      title: string
      amount: number
      sourceAccountName?: string
      sourceAccountId: string
      destAccountName?: string
      destAccountId: string
      referenceId: string
      description?: string
      timestamp: string
    }
  | {
      type: 'account'
      title: string
      accountName: string
      accountId: string
      balance: number
      timestamp: string
    }
  | {
      type: 'balance'
      title: string
      accountName?: string
      accountId?: string
      balance?: number
      createdAt?: string
      timestamp: string
    }
)

type ModalState = {
  isCreateAccountOpen: boolean
  isAddTransactionOpen: boolean
  isTransferOpen: boolean
  isCheckBalanceOpen: boolean
}

type AppStore = {
  // Active context
  activeAccountId: string | null
  setActiveAccountId: (id: string | null) => void

  // Sidebar
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Transaction filters (ephemeral UI)
  transactionFilter: 'all' | 'credit' | 'debit'
  setTransactionFilter: (f: 'all' | 'credit' | 'debit') => void

  transactionPage: number
  setTransactionPage: (page: number) => void

  transactionLimit: number
  setTransactionLimit: (limit: number) => void

  // Modals
  modals: ModalState
  openCreateAccount: () => void
  openAddTransaction: () => void
  openTransfer: () => void
  openCheckBalance: () => void
  closeAllModals: () => void

  // Transaction / Action Completion Popup
  completionData: CompletionModalData | null
  openCompletion: (data: CompletionModalData) => void
  closeCompletion: () => void
}

const DEFAULT_MODALS: ModalState = {
  isCreateAccountOpen:  false,
  isAddTransactionOpen: false,
  isTransferOpen:       false,
  isCheckBalanceOpen:   false,
}

const STORAGE_KEY_ACTIVE_ACCOUNT = 'emerald_active_account_id'

const getInitialActiveAccountId = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ACCOUNT)
}

export const useAppStore = create<AppStore>((set) => ({
  // ─── Active Account ─────────────────────────────────────────
  activeAccountId: getInitialActiveAccountId(),
  setActiveAccountId: (id) => {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ACCOUNT, id)
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ACCOUNT)
      }
    }
    set({ activeAccountId: id })
  },

  // ─── Sidebar ─────────────────────────────────────────────────
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // ─── Filters ─────────────────────────────────────────────────
  transactionFilter: 'all',
  setTransactionFilter: (f) => set({ transactionFilter: f, transactionPage: 1 }),

  transactionPage: 1,
  setTransactionPage: (page) => set({ transactionPage: Math.max(1, page) }),

  transactionLimit: 5,
  setTransactionLimit: (limit) => set({ transactionLimit: limit, transactionPage: 1 }),

  // ─── Modals ───────────────────────────────────────────────────
  modals: DEFAULT_MODALS,
  openCreateAccount:  () => set({ modals: { ...DEFAULT_MODALS, isCreateAccountOpen: true } }),
  openAddTransaction: () => set({ modals: { ...DEFAULT_MODALS, isAddTransactionOpen: true } }),
  openTransfer:       () => set({ modals: { ...DEFAULT_MODALS, isTransferOpen: true } }),
  openCheckBalance:   () => set({ modals: { ...DEFAULT_MODALS, isCheckBalanceOpen: true } }),
  closeAllModals:     () => set({ modals: DEFAULT_MODALS }),

  // ─── Completion Popup ─────────────────────────────────────────
  completionData: null,
  openCompletion: (data) => set({ completionData: data }),
  closeCompletion: () => set({ completionData: null }),
}))
