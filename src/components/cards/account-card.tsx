import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Copy, Check } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import type { Account } from '@/types'
import { formatINR, CURRENCY_SYMBOL } from '@/lib/currency'

interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  const { activeAccountId, setActiveAccountId } = useAppStore()
  const [copied, setCopied] = useState(false)
  const isSelected = activeAccountId === account.id
  const formattedBalance = formatINR(account.balance || 0, { showSymbol: false })

  const formattedDate = new Date(account.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const copyId = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(account.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Link
      to="/accounts/$id"
      params={{ id: account.id }}
      onClick={() => setActiveAccountId(account.id)}
      className={`group block bg-white rounded-2xl p-5 card-shadow transition-all ${
        isSelected
          ? 'border-2 border-[#006a4e] ring-2 ring-[#006a4e]/10 shadow-sm'
          : 'border border-[#f1f5f9] hover:border-[#006a4e]/40 hover:shadow-md'
      }`}
    >
      {/* Header: Name + Arrow */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4
            className={`font-bold text-base transition-colors leading-snug ${
              isSelected
                ? 'text-[#006a4e]'
                : 'text-[#141b2b] group-hover:text-[#006a4e]'
            }`}
          >
            {account.name}
          </h4>
          <p className="text-xs text-[#6b7280] mt-0.5">Created {formattedDate}</p>
        </div>
        <div
          className={`p-1.5 rounded-lg transition-colors ${
            isSelected
              ? 'bg-[#006a4e]/10 text-[#006a4e]'
              : 'bg-[#f8fafc] text-[#9ca3af] group-hover:bg-[#f1f3ff] group-hover:text-[#006a4e]'
          }`}
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Account ID Badge with Quick Copy */}
      <div className="mt-3">
        <button
          type="button"
          onClick={copyId}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f8fafc] hover:bg-[#f1f3ff] border border-[#e5e7eb] text-[11px] font-mono text-[#3f4944] transition-colors max-w-full group/copy"
          title="Click to copy full Account ID"
        >
          <span className="text-[#6f7a73] font-sans font-semibold">ID:</span>
          <span className="truncate">{account.id}</span>
          {copied ? (
            <Check className="w-3 h-3 text-[#00875a] shrink-0" />
          ) : (
            <Copy className="w-3 h-3 text-[#9ca3af] group-hover/copy:text-[#006a4e] shrink-0" />
          )}
        </button>
      </div>

      {/* Balance Footer */}
      <div className="mt-4 pt-3.5 border-t border-[#f3f4f6] flex items-baseline justify-between">
        <span className="text-xs font-semibold text-[#6f7a73] uppercase tracking-wider">
          Available Balance
        </span>
        <div className="text-lg sm:text-xl font-bold text-[#111827] font-mono-nums">
          <span className="text-xs text-[#6b7280] mr-1">{CURRENCY_SYMBOL}</span>
          {formattedBalance}
        </div>
      </div>
    </Link>
  )
}
