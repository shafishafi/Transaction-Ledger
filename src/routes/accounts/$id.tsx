import { useEffect, useState } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useAccount } from '@/hooks/use-accounts'
import { useAppStore } from '@/store/app-store'
import { HeroBalanceCard } from '@/components/cards/hero-balance-card'
import { StatCard } from '@/components/cards/stat-card'
import { TransactionTable } from '@/components/transactions/transaction-table'
import {
  ArrowLeft,
  Plus,
  ArrowRightLeft,
  Loader2,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react'

export const accountDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts/$id',
  component: AccountDetailPage,
})

function AccountDetailPage() {
  const { id } = accountDetailRoute.useParams()
  const [copied, setCopied] = useState(false)
  const { data: account, isLoading, isError } = useAccount(id)
  const { setActiveAccountId, openAddTransaction, openTransfer } = useAppStore()

  const copyId = () => {
    if (account?.id) {
      navigator.clipboard.writeText(account.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    setActiveAccountId(id)
  }, [id, setActiveAccountId])

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-xs text-[#6b7280]">
        <Loader2 className="w-8 h-8 animate-spin text-[#006a4e]" />
        <span>Loading account details...</span>
      </div>
    )
  }

  if (isError || !account) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-[#111827]">Account Not Found</h3>
        <p className="text-xs text-[#6b7280] mt-1">
          The requested ledger account could not be found or has been deleted.
        </p>
        <Link
          to="/accounts"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006a4e] text-white text-xs font-semibold hover:bg-[#005740] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Accounts
        </Link>
      </div>
    )
  }

  const createdDate = new Date(account.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Navigation / Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/accounts"
            onClick={() => setActiveAccountId(null)}
            className="p-2 rounded-xl bg-white border border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
                {account.name}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#00875a]">
                Active Ledger
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#006a4e] border border-[#8af5be]/60">
                Overdraft Protected
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={copyId}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white border border-[#e5e7eb] hover:bg-[#f3f4f6] text-xs font-mono text-[#3f4944] transition-colors"
                title="Click to copy full Account ID"
              >
                <span className="text-[#6f7a73] font-sans font-semibold">ID:</span>
                <span>{account.id}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[#00875a]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#9ca3af]" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={openTransfer}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] text-xs font-semibold text-[#141b2b] transition-all"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#006a4e]" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={openAddTransaction}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#005740] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="md:col-span-2 lg:col-span-6">
          <HeroBalanceCard
            title="Available Balance"
            balance={Number(account.balance || 0)}
            subtitle={`Account Ledger for ${account.name}`}
          />
        </div>

        <div className="md:col-span-1 lg:col-span-3">
          <StatCard
            title="Creation Date"
            value={createdDate}
            subtitle="Ledger inception"
          />
        </div>

        <div className="md:col-span-1 lg:col-span-3">
          <StatCard
            title="Account ID"
            value={account.id}
          />
        </div>
      </div>

      {/* Transactions Section */}
      <TransactionTable accountId={account.id} />
    </div>
  )
}

