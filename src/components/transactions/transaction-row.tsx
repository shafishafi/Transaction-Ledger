import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { Transaction } from '@/types'
import { formatINR, CURRENCY_SYMBOL } from '@/lib/currency'
import { formatCleanReferenceId } from '@/lib/reference'

interface TransactionRowProps {
  transaction: Transaction
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isCredit = transaction.type === 'credit'

  const formattedAmount = formatINR(transaction.amount, { showSymbol: false })

  const formattedDate = new Date(transaction.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedTime = new Date(transaction.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <tr className="border-b border-[#f3f4f6] hover:bg-[#f9f9ff] transition-colors">
      {/* Type & Icon */}
      <td className="py-4 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isCredit
                ? 'bg-[#d1fae5] text-[#00875a]'
                : 'bg-[#ffdad6] text-[#ba1a1a]'
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft className="w-4 h-4" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="font-semibold text-xs text-[#141b2b]">
              {transaction.description || (isCredit ? 'Credit Deposit' : 'Debit Withdrawal')}
            </p>
            <p className="text-[11px] font-mono text-[#6b7280] mt-0.5">
              Ref: {formatCleanReferenceId(transaction.reference_id)}
            </p>
          </div>
        </div>
      </td>

      {/* Timestamp */}
      <td className="py-4 px-4 text-xs text-[#3f4944]">
        <div>{formattedDate}</div>
        <div className="text-[11px] text-[#6b7280] mt-0.5">{formattedTime}</div>
      </td>

      {/* Status Badge */}
      <td className="py-4 px-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#d1fae5] text-[#00875a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00875a]" />
          Completed
        </span>
      </td>

      {/* Amount */}
      <td className="py-4 pl-4 pr-6 text-right font-mono-nums">
        <span
          className={`font-bold text-sm ${
            isCredit ? 'text-[#00875a]' : 'text-[#ba1a1a]'
          }`}
        >
          {isCredit ? '+' : '-'}{CURRENCY_SYMBOL}{formattedAmount}
        </span>
      </td>
    </tr>
  )
}

