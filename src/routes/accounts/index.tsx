import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useAccounts } from '@/hooks/use-accounts'
import { HeroBalanceCard } from '@/components/cards/hero-balance-card'
import { StatCard } from '@/components/cards/stat-card'
import { AccountCard } from '@/components/cards/account-card'
import { useAppStore } from '@/store/app-store'
import { formatINR } from '@/lib/currency'
import { Wallet, Plus, ArrowRightLeft, Loader2, Search } from 'lucide-react'

export const accountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts',
  component: AccountsIndexPage,
})

function AccountsIndexPage() {
  const { data: accounts, isLoading, isError } = useAccounts()
  const { openCreateAccount, openTransfer, openCheckBalance } = useAppStore()

  const totalBalance = (accounts ?? []).reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0
  )
  const totalCount = accounts?.length ?? 0
  const avgBalance = totalCount > 0 ? totalBalance / totalCount : 0

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight">
            Treasury Overview
          </h2>
          <p className="text-sm text-[#6b7280] mt-1">
            Real-time balance monitoring and atomic ledger records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={openCheckBalance}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] text-xs font-semibold text-[#141b2b] transition-all"
          >
            <Search className="w-4 h-4 text-[#006a4e]" />
            <span>Check Balance</span>
          </button>

          <button
            onClick={openTransfer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] text-xs font-semibold text-[#141b2b] transition-all"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#006a4e]" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={openCreateAccount}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#005740] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="md:col-span-2 lg:col-span-6">
          <HeroBalanceCard
            title="Consolidated Balance"
            balance={totalBalance}
            accountCount={totalCount}
          />
        </div>

        <div className="md:col-span-1 lg:col-span-3">
          <StatCard
            title="Active Ledgers"
            value={totalCount}
            change="+100%"
            isPositive={true}
            subtitle="Verified on DB"
          />
        </div>

        <div className="md:col-span-1 lg:col-span-3">
          <StatCard
            title="Average Balance"
            value={formatINR(avgBalance)}
            change="+2.4%"
            isPositive={true}
            subtitle="Per ledger account"
          />
        </div>
      </div>

      {/* Accounts Ledger Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#111827]">Treasury Accounts</h3>
          <span className="text-xs font-semibold text-[#6b7280]">
            {totalCount} Total Accounts
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-[#6b7280]">
            <Loader2 className="w-8 h-8 animate-spin text-[#006a4e]" />
            <span>Fetching ledger accounts from Supabase...</span>
          </div>
        ) : isError ? (
          <div className="p-8 rounded-2xl bg-white border border-[#ffdad6] text-center text-xs text-[#ba1a1a]">
            Failed to load accounts. Please check your Supabase credentials in .env.local.
          </div>
        ) : accounts?.length === 0 ? (
          <div className="py-16 px-6 rounded-2xl bg-white border border-[#f1f5f9] text-center card-shadow max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#f1f3ff] text-[#006a4e] flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-[#111827]">No Accounts Yet</h4>
            <p className="text-xs text-[#6b7280] mt-1.5 leading-relaxed">
              Create your first treasury ledger account to start tracking transactions and atomic balances.
            </p>
            <button
              onClick={openCreateAccount}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#005740] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts?.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

