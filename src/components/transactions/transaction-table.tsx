import { FilterBar } from './filter-bar'
import { PaginationBar } from './pagination-bar'
import { TransactionRow } from './transaction-row'
import { useTransactions } from '@/hooks/use-transactions'
import { useAppStore } from '@/store/app-store'
import { ArrowUpDown, FileText, Loader2, Plus } from 'lucide-react'

interface TransactionTableProps {
  accountId: string
}

export function TransactionTable({ accountId }: TransactionTableProps) {
  const {
    transactionFilter,
    transactionPage,
    setTransactionPage,
    transactionLimit,
    setTransactionLimit,
    openAddTransaction,
  } = useAppStore()

  const effectiveType = transactionFilter === 'all' ? undefined : transactionFilter

  const { data, isLoading, isError } = useTransactions(accountId, {
    page: transactionPage,
    limit: transactionLimit,
    pageSize: transactionLimit,
    type: effectiveType,
  })

  return (
    <div className="bg-white rounded-2xl card-shadow border border-[#f1f5f9] overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-5 sm:p-6 border-b border-[#f3f4f6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#111827]">Ledger Transactions</h3>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Immutable transaction records recorded with strict overdraft protection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FilterBar />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left border-collapse">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#f3f4f6] text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">
              <th className="py-3.5 pl-6 pr-3">Transaction & Reference</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 pl-4 pr-6 text-right">
                <div className="inline-flex items-center gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-xs text-[#6b7280]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#006a4e]" />
                    <span>Loading ledger records...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs text-[#ba1a1a]">
                  Failed to load transaction history. Please verify your Supabase connection.
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-xs text-[#6b7280]">
                  <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-[#f8fafc] border border-[#e5e7eb] flex items-center justify-center text-[#6b7280]">
                      <FileText className="w-6 h-6 text-[#9ca3af]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#111827]">No transactions found</p>
                      <p className="text-xs text-[#6b7280] mt-1">
                        There are no recorded transactions matching the current filters.
                      </p>
                    </div>
                    <button
                      onClick={openAddTransaction}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-semibold hover:bg-[#005740] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Post First Transaction
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              data?.data.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (Current Page, Page Size / Limit, Total Records, Total Pages) */}
      {data && (
        <PaginationBar
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalRecords={data.totalRecords}
          pageSize={data.pageSize}
          limit={data.limit}
          onPageChange={setTransactionPage}
          onLimitChange={setTransactionLimit}
        />
      )}
    </div>
  )
}

