import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAppStore } from '@/store/app-store'
import { formatINR } from '@/lib/currency'
import { formatCleanReferenceId } from '@/lib/reference'
import {
  CheckCircle2,
  AlertOctagon,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  X,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'

export function CompletionDialog() {
  const {
    completionData,
    closeCompletion,
    openAddTransaction,
    openTransfer,
    openCreateAccount,
    openCheckBalance,
    setActiveAccountId,
  } = useAppStore()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!completionData) return null

  const isFailed = completionData.status === 'failed'

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleRetry = () => {
    const type = completionData.type
    closeCompletion()
    if (type === 'transfer') {
      openTransfer()
    } else if (type === 'account') {
      openCreateAccount()
    } else if (type === 'balance') {
      openCheckBalance()
    } else {
      openAddTransaction()
    }
  }

  const formatDate = (isoString?: string) => {
    try {
      const date = isoString ? new Date(isoString) : new Date()
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date)
    } catch {
      return 'Just now'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeCompletion}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-[480px] bg-white rounded-2xl p-4 sm:p-6 card-shadow border border-[#f1f5f9] z-10 my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeCompletion}
          className="absolute top-4 right-4 text-[#6b7280] hover:text-[#111827] p-1.5 rounded-xl hover:bg-[#f3f4f6] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration or Alert Icon */}
        <div className="text-center pt-1 pb-4">
          {isFailed ? (
            <div className="w-16 h-16 rounded-full bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center ring-8 ring-[#ba1a1a]/5 mx-auto mb-3 shadow-inner">
              <AlertOctagon className="w-9 h-9 text-[#ba1a1a] animate-in zoom-in-50 duration-300" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center ring-8 ring-[#006a4e]/5 mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-[#006a4e] animate-in zoom-in-50 duration-300" />
            </div>
          )}

          {isFailed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad6] text-[#ba1a1a] uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse" />
              Transaction Rejected • Overdraft Protection
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d1fae5] text-[#006a4e] uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a4e] animate-pulse" />
              Ledger Settled & Verified
            </span>
          )}

          <h3 className="text-xl font-extrabold text-[#111827] tracking-tight">
            {completionData.title}
          </h3>
          <p className="text-xs text-[#6b7280] mt-1">
            {isFailed
              ? 'Ledger integrity preserved. Balance unchanged.'
              : 'Transaction recorded immutably in PostgreSQL ledger'}
          </p>

          {/* Prominent Amount Display */}
          {'amount' in completionData && (
            <div className="mt-4 py-2">
              <div
                className={`text-3xl sm:text-4xl font-black font-mono-nums tracking-tight ${
                  isFailed
                    ? 'text-[#ba1a1a]'
                    : completionData.type === 'transaction' && completionData.txType === 'debit'
                    ? 'text-[#ba1a1a]'
                    : 'text-[#006a4e]'
                }`}
              >
                {!isFailed && completionData.type === 'transaction' && completionData.txType === 'credit' && '+ '}
                {(isFailed || (completionData.type === 'transaction' && completionData.txType === 'debit')) && '- '}
                {formatINR(completionData.amount)}
              </div>
              <span
                className={`text-[11px] font-bold tracking-wider uppercase ${
                  isFailed ? 'text-[#ba1a1a]' : 'text-[#6b7280]'
                }`}
              >
                {isFailed
                  ? completionData.type === 'transfer'
                    ? 'Attempted Transfer Rejected'
                    : 'Attempted Debit Rejected'
                  : completionData.type === 'transfer'
                  ? 'Total Transferred (INR)'
                  : completionData.type === 'transaction' && completionData.txType === 'credit'
                  ? 'Credited to Ledger'
                  : 'Debited from Ledger'}
              </span>
            </div>
          )}

          {completionData.type === 'account' && !isFailed && (
            <div className="mt-4 py-2">
              <div className="text-3xl font-black font-mono-nums tracking-tight text-[#006a4e]">
                {formatINR(completionData.balance)}
              </div>
              <span className="text-[11px] font-bold text-[#6b7280] tracking-wider uppercase">
                Initial Opening Balance
              </span>
            </div>
          )}

          {completionData.type === 'balance' && !isFailed && completionData.balance !== undefined && (
            <div className="mt-4 py-2">
              <div className="text-3xl sm:text-4xl font-black font-mono-nums tracking-tight text-[#006a4e]">
                {formatINR(completionData.balance)}
              </div>
              <span className="text-[11px] font-bold text-[#6b7280] tracking-wider uppercase">
                Available Ledger Balance
              </span>
            </div>
          )}
        </div>

        {/* Ledger Receipt Card */}
        <div className="bg-[#f8fafc] rounded-xl border border-[#e5e7eb] p-4 text-xs space-y-2.5">
          {/* Prominent Failure Reason Banner */}
          {isFailed && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#ffdad6]/60 border border-[#ffdad6] text-[#93000a] mb-2">
              <AlertCircle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-xs text-[#ba1a1a]">Rejection Reason</span>
                <span className="block text-xs font-medium text-[#ba1a1a]">
                  {completionData.errorMessage || 'Transaction Failed: Insufficient funds for this debit.'}
                </span>
              </div>
            </div>
          )}

          {/* Transaction Type Details */}
          {completionData.type === 'transaction' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Account</span>
                <div className="flex items-center gap-1.5 font-medium text-[#111827]">
                  <span>{completionData.accountName || 'Account'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(completionData.accountId, 'account_id')}
                    className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md bg-[#e5e7eb] text-[#1f2937] hover:bg-[#d1d5db] transition-colors"
                    title="Copy Account ID"
                  >
                    <span>{completionData.accountId}</span>
                    {copiedKey === 'account_id' ? (
                      <Check className="w-3 h-3 text-[#006a4e]" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#6b7280]" />
                    )}
                  </button>
                </div>
              </div>

              {completionData.currentBalance !== undefined && isFailed && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6f7a73] font-semibold">Available Balance</span>
                  <span className="font-bold font-mono-nums text-[#141b2b]">
                    {formatINR(completionData.currentBalance)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Transaction Type</span>
                <span className="font-semibold capitalize text-[#111827]">
                  {completionData.txType === 'credit' ? 'Deposit (Credit)' : 'Withdrawal (Debit)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Reference ID</span>
                <button
                  type="button"
                  onClick={() => handleCopy(completionData.referenceId, 'ref_id')}
                  className="inline-flex items-center gap-1 font-mono font-semibold text-[#111827] hover:text-[#006a4e] transition-colors"
                  title="Copy Reference ID"
                >
                  <span>{formatCleanReferenceId(completionData.referenceId)}</span>
                  {copiedKey === 'ref_id' ? (
                    <Check className="w-3 h-3 text-[#006a4e]" />
                  ) : (
                    <Copy className="w-3 h-3 text-[#9ca3af]" />
                  )}
                </button>
              </div>

              {completionData.description && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6f7a73] font-semibold">Memo</span>
                  <span className="font-medium text-[#111827] max-w-[200px] truncate text-right">
                    {completionData.description}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-2">
                <span className="text-[#6f7a73] font-semibold">Timestamp</span>
                <span className="font-medium text-[#4b5563]">
                  {formatDate(completionData.timestamp)}
                </span>
              </div>
            </>
          )}

          {/* Transfer Details */}
          {completionData.type === 'transfer' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#6f7a73] font-semibold">Source (Debit)</span>
                  <div className="flex items-center gap-1 font-medium text-[#111827]">
                    <span className="max-w-[180px] sm:max-w-[240px] truncate text-right">
                      {completionData.sourceAccountName || 'Source'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(completionData.sourceAccountId, 'src_id')}
                      className="font-mono font-bold px-1.5 py-0.5 rounded bg-[#e5e7eb] text-[11px]"
                    >
                      {completionData.sourceAccountId}
                    </button>
                  </div>
                </div>

                {completionData.currentBalance !== undefined && isFailed && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6f7a73] font-semibold">Source Balance</span>
                    <span className="font-bold font-mono-nums text-[#141b2b]">
                      {formatINR(completionData.currentBalance)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center my-1 text-[#006a4e]">
                  <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6f7a73] font-semibold">Destination (Credit)</span>
                  <div className="flex items-center gap-1 font-medium text-[#111827]">
                    <span className="max-w-[180px] sm:max-w-[240px] truncate text-right">
                      {completionData.destAccountName || 'Destination'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(completionData.destAccountId, 'dst_id')}
                      className="font-mono font-bold px-1.5 py-0.5 rounded bg-[#e5e7eb] text-[11px]"
                    >
                      {completionData.destAccountId}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e5e7eb] pt-2 flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Reference ID</span>
                <button
                  type="button"
                  onClick={() => handleCopy(completionData.referenceId, 'ref_id')}
                  className="inline-flex items-center gap-1 font-mono font-semibold text-[#111827] hover:text-[#006a4e] transition-colors"
                >
                  <span>{formatCleanReferenceId(completionData.referenceId)}</span>
                  {copiedKey === 'ref_id' ? (
                    <Check className="w-3 h-3 text-[#006a4e]" />
                  ) : (
                    <Copy className="w-3 h-3 text-[#9ca3af]" />
                  )}
                </button>
              </div>

              {completionData.description && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6f7a73] font-semibold">Memo</span>
                  <span className="font-medium text-[#111827] max-w-[200px] truncate text-right">
                    {completionData.description}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-2">
                <span className="text-[#6f7a73] font-semibold">Timestamp</span>
                <span className="font-medium text-[#4b5563]">
                  {formatDate(completionData.timestamp)}
                </span>
              </div>
            </>
          )}

          {/* Account Creation Details */}
          {completionData.type === 'account' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Account Holder</span>
                <span className="font-bold text-[#111827]">{completionData.accountName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Assigned Account ID</span>
                <button
                  type="button"
                  onClick={() => handleCopy(completionData.accountId, 'acc_id')}
                  className="inline-flex items-center gap-1.5 font-mono font-bold px-2 py-1 rounded-md bg-[#006a4e]/10 text-[#006a4e] hover:bg-[#006a4e]/20 transition-colors"
                  title="Copy 8-character Account ID"
                >
                  <span>{completionData.accountId}</span>
                  {copiedKey === 'acc_id' ? (
                    <Check className="w-3 h-3 text-[#006a4e]" />
                  ) : (
                    <Copy className="w-3 h-3 text-[#006a4e]" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">ID Format</span>
                <span className="font-semibold text-[#6b7280]">8-Digit Account ID</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Overdraft</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#006a4e]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006a4e]" />
                  <span>Protection Active</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-2">
                <span className="text-[#6f7a73] font-semibold">Created At</span>
                <span className="font-medium text-[#4b5563]">
                  {formatDate(completionData.timestamp)}
                </span>
              </div>
            </>
          )}

          {/* Balance Inquiry Details */}
          {completionData.type === 'balance' && !isFailed && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Account Holder</span>
                <span className="font-bold text-[#111827]">{completionData.accountName}</span>
              </div>

              {completionData.accountId && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6f7a73] font-semibold">Account ID</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(completionData.accountId!, 'bal_acc_id')}
                    className="inline-flex items-center gap-1.5 font-mono font-bold px-2 py-0.5 rounded-md bg-[#e5e7eb] text-[#111827] hover:bg-[#d1d5db] transition-colors"
                    title="Copy Account ID"
                  >
                    <span>{completionData.accountId}</span>
                    {copiedKey === 'bal_acc_id' ? (
                      <Check className="w-3 h-3 text-[#006a4e]" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#6b7280]" />
                    )}
                  </button>
                </div>
              )}

              {completionData.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6f7a73] font-semibold">Created Date</span>
                  <span className="font-medium text-[#4b5563]">
                    {formatDate(completionData.createdAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[#6f7a73] font-semibold">Overdraft</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#006a4e]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006a4e]" />
                  <span>Protection Active</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-2">
                <span className="text-[#6f7a73] font-semibold">Query Timestamp</span>
                <span className="font-medium text-[#4b5563]">
                  {formatDate(completionData.timestamp)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-3">
          {isFailed ? (
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-xs font-bold text-[#141b2b] hover:bg-[#f3f4f6] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#6b7280]" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={closeCompletion}
                className="px-5 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Close
              </button>
            </>
          ) : (
            <>
              {completionData.type === 'account' && (
                <Link
                  to="/accounts/$id"
                  params={{ id: completionData.accountId }}
                  onClick={closeCompletion}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-xs font-bold text-[#141b2b] hover:bg-[#f3f4f6] transition-colors"
                >
                  <span>View Account</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              {completionData.type === 'transaction' && (
                <Link
                  to="/accounts/$id"
                  params={{ id: completionData.accountId }}
                  onClick={closeCompletion}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-xs font-bold text-[#141b2b] hover:bg-[#f3f4f6] transition-colors"
                >
                  <span>View Account</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              {completionData.type === 'transfer' && (
                <Link
                  to="/accounts/$id"
                  params={{ id: completionData.destAccountId }}
                  onClick={closeCompletion}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-xs font-bold text-[#141b2b] hover:bg-[#f3f4f6] transition-colors"
                >
                  <span>View Destination Account</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              {completionData.type === 'balance' && completionData.accountId && (
                <>
                  <Link
                    to="/accounts/$id"
                    params={{ id: completionData.accountId }}
                    onClick={closeCompletion}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-xs font-bold text-[#141b2b] hover:bg-[#f3f4f6] transition-colors"
                  >
                    <span>View Statement</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      const accId = completionData.accountId
                      closeCompletion()
                      if (accId) {
                        setActiveAccountId(accId)
                        openAddTransaction()
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#006a4e]/30 text-xs font-bold text-[#006a4e] hover:bg-[#f0fdf4] transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#006a4e]" />
                    <span>Post Transaction</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={closeCompletion}
                className="px-5 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#005740] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
