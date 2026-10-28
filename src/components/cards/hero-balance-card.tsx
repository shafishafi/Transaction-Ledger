import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { formatINR, CURRENCY_SYMBOL, CURRENCY_CODE } from '@/lib/currency'

interface HeroBalanceCardProps {
  title?: string
  balance: number
  subtitle?: string
  accountCount?: number
  onViewDetails?: () => void
}

export function HeroBalanceCard({
  title = 'Consolidated Balance',
  balance,
  subtitle = 'Live ledger balance across all accounts',
  accountCount,
  onViewDetails,
}: HeroBalanceCardProps) {
  const { openAddTransaction } = useAppStore()

  const formattedBalance = formatINR(balance || 0, { showSymbol: false })

  return (
    <div className="relative overflow-hidden rounded-2xl hero-gradient p-5 sm:p-7 text-white hero-shadow border border-emerald-700/30">
      {/* Background ambient pattern */}
      <div className="absolute -right-8 -top-8 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-12 bottom-0 w-32 h-32 bg-[#8af5be]/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Card Header - Simple & Clean */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#8af5be] uppercase tracking-wider">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-emerald-100/80 mt-0.5">{subtitle}</p>
            )}
          </div>

          {accountCount !== undefined && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/15 text-white shrink-0">
              {accountCount} {accountCount === 1 ? 'Account' : 'Accounts'}
            </span>
          )}
        </div>

        {/* Currency Display */}
        <div className="my-5 sm:my-6">
          <div className="flex items-baseline gap-1.5 font-mono-nums">
            <span className="text-2xl sm:text-3xl font-semibold text-[#8af5be]">
              {CURRENCY_SYMBOL}
            </span>
            <span className="text-3xl sm:text-4xl font-bold tracking-tight">
              {formattedBalance}
            </span>
            <span className="text-xs font-medium text-emerald-200/80 ml-1">
              {CURRENCY_CODE}
            </span>
          </div>
        </div>

        {/* Card Footer / Action row */}
        <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-100/90">
            <ShieldCheck className="w-4 h-4 text-[#8af5be] shrink-0" />
            <span className="text-xs font-normal">Overdraft Protection Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddTransaction}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#00503a] hover:bg-emerald-50 text-xs font-semibold shadow-xs transition-colors"
            >
              Deposit / Debit
            </button>
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="flex items-center gap-1 text-xs text-white hover:text-[#8af5be] font-medium transition-colors"
              >
                <span>Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
