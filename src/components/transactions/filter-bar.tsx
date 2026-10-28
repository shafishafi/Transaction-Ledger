import { useAppStore } from '@/store/app-store'

export function FilterBar() {
  const { transactionFilter, setTransactionFilter } = useAppStore()

  return (
    <div className="inline-flex p-1 bg-[#f3f4f6] rounded-xl text-xs font-semibold">
      <button
        onClick={() => setTransactionFilter('all')}
        className={`px-3 py-1.5 rounded-lg transition-all ${
          transactionFilter === 'all'
            ? 'bg-[#111827] text-white shadow-xs'
            : 'text-[#6b7280] hover:text-[#111827]'
        }`}
      >
        All
      </button>
      <button
        onClick={() => setTransactionFilter('credit')}
        className={`px-3 py-1.5 rounded-lg transition-all ${
          transactionFilter === 'credit'
            ? 'bg-[#006a4e] text-white shadow-xs'
            : 'text-[#6b7280] hover:text-[#111827]'
        }`}
      >
        Credit
      </button>
      <button
        onClick={() => setTransactionFilter('debit')}
        className={`px-3 py-1.5 rounded-lg transition-all ${
          transactionFilter === 'debit'
            ? 'bg-[#ba1a1a] text-white shadow-xs'
            : 'text-[#6b7280] hover:text-[#111827]'
        }`}
      >
        Debit
      </button>
    </div>
  )
}

