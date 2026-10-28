import { useState, useEffect } from 'react'
import { useProcessTransaction } from '@/hooks/use-transactions'
import { useAccounts } from '@/hooks/use-accounts'
import { useAppStore } from '@/store/app-store'
import { Dialog } from '@/components/ui/dialog'
import { mapSupabaseError } from '@/lib/error-map'
import { formatINR, CURRENCY_SYMBOL, CURRENCY_CODE } from '@/lib/currency'
import { generateReferenceId } from '@/lib/reference'
import {
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react'

export function AddTransactionDialog() {
  const { modals, closeAllModals, activeAccountId, openCompletion } = useAppStore()
  const { data: accounts } = useAccounts()

  const [accountIdInput, setAccountIdInput] = useState('')
  const [txType, setTxType] = useState<'credit' | 'debit'>('credit')
  const [amountInput, setAmountInput] = useState<string>('')
  const [description, setDescription] = useState('')
  const [referenceId, setReferenceId] = useState('')

  const processTx = useProcessTransaction(accountIdInput)

  useEffect(() => {
    if (modals.isAddTransactionOpen) {
      const defaultId = activeAccountId || accounts?.[0]?.id || ''
      setAccountIdInput(defaultId)
      setTxType('credit')
      setAmountInput('')
      setDescription('')
      setReferenceId(generateReferenceId('internal'))
    }
  }, [modals.isAddTransactionOpen, activeAccountId, accounts])

  const targetAccount = accounts?.find(
    (a) => a.id.toUpperCase() === accountIdInput.trim().toUpperCase()
  )
  const isVerified = Boolean(targetAccount)

  const numAmount = parseFloat(amountInput) || 0
  const isInsufficientFunds =
    txType === 'debit' && targetAccount !== undefined && numAmount > (targetAccount.balance || 0)
  const isAmountValid = numAmount > 0 && !isInsufficientFunds

  const canExecute = isVerified && isAmountValid && !processTx.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canExecute || !targetAccount) return

    const finalRefId = referenceId.trim() || generateReferenceId('internal')

    processTx.mutate(
      {
        p_account_id: targetAccount.id,
        p_type: txType,
        p_amount: numAmount,
        p_description: description.trim() || undefined,
        p_reference_id: finalRefId,
      },
      {
        onSuccess: (tx) => {
          closeAllModals()
          openCompletion({
            status: 'success',
            type: 'transaction',
            title: txType === 'credit' ? 'Deposit Completed' : 'Withdrawal Completed',
            amount: numAmount,
            txType,
            accountName: targetAccount.name,
            accountId: targetAccount.id,
            referenceId: finalRefId,
            description: description.trim() || undefined,
            timestamp: tx?.created_at || new Date().toISOString(),
          })
        },
        onError: (err: any) => {
          closeAllModals()
          const userMsg = mapSupabaseError(err)
          openCompletion({
            status: 'failed',
            type: 'transaction',
            title: txType === 'credit' ? 'Deposit Failed' : 'Transaction Failed',
            errorMessage: userMsg,
            amount: numAmount,
            txType,
            accountName: targetAccount.name,
            accountId: targetAccount.id,
            referenceId: finalRefId,
            description: description.trim() || undefined,
            currentBalance: Number(targetAccount.balance),
            timestamp: new Date().toISOString(),
          })
        },
      }
    )
  }

  return (
    <Dialog
      open={modals.isAddTransactionOpen}
      onClose={closeAllModals}
      title="Add Transaction"
      description="Verify account ID and holder name before recording ledger transaction."
    >
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Account ID Input + Name Verification */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Target Account ID
          </label>

          <div className="relative">
            <input
              type="text"
              value={accountIdInput}
              onChange={(e) => setAccountIdInput(e.target.value.toUpperCase().trim())}
              placeholder="e.g. AC107K9P"
              maxLength={8}
              className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl border text-sm text-[#141b2b] font-mono tracking-wider uppercase bg-white focus:outline-none focus:ring-2 transition-all ${
                accountIdInput.length >= 8 && !isVerified
                  ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20 focus:border-[#ba1a1a]'
                  : isVerified
                  ? 'border-[#006a4e] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
                  : 'border-[#e5e7eb] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
              }`}
            />
            {isVerified && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#006a4e] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#006a4e]" />
                <span className="hidden sm:inline">Verified</span>
              </div>
            )}
          </div>

          {/* Verified Name Badge */}
          {isVerified && targetAccount ? (
            <div className="mt-1.5 p-2 sm:p-2.5 rounded-xl bg-[#f0fdf4] border border-[#8af5be] flex items-center gap-2.5 animate-in fade-in duration-200">
              <div className="w-6 h-6 rounded-full bg-[#d1fae5] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-[#006a4e]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#00503a] truncate">
                    {targetAccount.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#d1fae5] text-[#006a4e] shrink-0">
                    {targetAccount.id}
                  </span>
                </div>
                <p className="text-[11px] text-[#006a4e]/90 font-medium mt-0.5">
                  Available: {formatINR(targetAccount.balance)}
                </p>
              </div>
            </div>
          ) : accountIdInput.length >= 8 ? (
            <div className="mt-1.5 p-2 rounded-xl bg-[#fff5f5] border border-[#ba1a1a]/30 flex items-center gap-2 text-[#ba1a1a] text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Account not found in ledger registry.</span>
            </div>
          ) : (
            <p className="text-[11px] text-[#6b7280] mt-1">
              Enter the 8-character Account ID to verify holder name.
            </p>
          )}
        </div>

        {/* Transaction Type Segmented Toggle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f3f4f6] rounded-xl">
            <button
              type="button"
              onClick={() => setTxType('credit')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                txType === 'credit'
                  ? 'bg-[#006a4e] text-white shadow-xs'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-[#8af5be] shrink-0" />
              <span>Credit (Deposit)</span>
            </button>
            <button
              type="button"
              onClick={() => setTxType('debit')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                txType === 'debit'
                  ? 'bg-[#ba1a1a] text-white shadow-xs'
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-[#ffdad6] shrink-0" />
              <span>Debit (Withdrawal)</span>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Amount ({CURRENCY_SYMBOL} {CURRENCY_CODE})
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="100.00"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#141b2b] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 transition-all font-mono-nums ${
              isInsufficientFunds
                ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20 focus:border-[#ba1a1a]'
                : 'border-[#e5e7eb] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
            }`}
          />
          {isInsufficientFunds && targetAccount && (
            <p className="text-xs text-[#ba1a1a] mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Insufficient funds! Available balance is {formatINR(targetAccount.balance)}.
              </span>
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dividend payment, Vendor invoice"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#141b2b] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] transition-all"
          />
        </div>

        {/* Reference ID */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Reference ID (Unique Idempotency Key)
          </label>
          <input
            type="text"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. INTTXN102941"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#141b2b] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] transition-all font-mono text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={closeAllModals}
            className="flex-1 sm:flex-initial px-4 py-2 sm:py-2.5 rounded-xl border border-[#e5e7eb] text-xs sm:text-sm font-semibold text-[#3f4944] hover:bg-[#f3f4f6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canExecute}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 sm:py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#005740] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processTx.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Make Transaction
          </button>
        </div>
      </form>
    </Dialog>
  )
}
