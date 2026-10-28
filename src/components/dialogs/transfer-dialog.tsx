import { useState, useEffect } from 'react'
import { useTransfer } from '@/hooks/use-transactions'
import { useAccounts } from '@/hooks/use-accounts'
import { useAppStore } from '@/store/app-store'
import { Dialog } from '@/components/ui/dialog'
import { mapSupabaseError } from '@/lib/error-map'
import { formatINR, CURRENCY_SYMBOL, CURRENCY_CODE } from '@/lib/currency'
import { generateReferenceId } from '@/lib/reference'
import {
  Loader2,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react'

export function TransferDialog() {
  const { modals, closeAllModals, activeAccountId, openCompletion } = useAppStore()
  const { data: accounts } = useAccounts()
  const transferMutation = useTransfer()

  const [sourceIdInput, setSourceIdInput] = useState('')
  const [targetIdInput, setTargetIdInput] = useState('')
  const [amountInput, setAmountInput] = useState<string>('')
  const [description, setDescription] = useState('')
  const [referenceId, setReferenceId] = useState('')

  // Initialize inputs whenever the modal opens
  useEffect(() => {
    if (modals.isTransferOpen) {
      const defaultSource = activeAccountId || accounts?.[0]?.id || ''
      setSourceIdInput(defaultSource)

      const otherAccount = accounts?.find((a) => a.id !== defaultSource)
      setTargetIdInput(otherAccount?.id || '')
      setAmountInput('')
      setDescription('')
      setReferenceId(generateReferenceId('other_account'))
    }
  }, [modals.isTransferOpen, activeAccountId, accounts])

  // Real-time lookup of Source & Target accounts
  const sourceAccount = accounts?.find(
    (a) => a.id.toUpperCase() === sourceIdInput.trim().toUpperCase()
  )
  const targetAccount = accounts?.find(
    (a) => a.id.toUpperCase() === targetIdInput.trim().toUpperCase()
  )

  const isSourceVerified = Boolean(sourceAccount)
  const isTargetVerified = Boolean(targetAccount)
  const isSameAccount = Boolean(
    sourceAccount &&
      targetAccount &&
      sourceAccount.id.toUpperCase() === targetAccount.id.toUpperCase()
  )
  const bothVerified = isSourceVerified && isTargetVerified && !isSameAccount

  const numAmount = parseFloat(amountInput) || 0
  const isInsufficientFunds =
    sourceAccount !== undefined && numAmount > (sourceAccount.balance || 0)
  const isAmountValid = numAmount > 0 && !isInsufficientFunds

  const canExecute = bothVerified && isAmountValid && !transferMutation.isPending

  const handleSourceIdChange = (val: string) => {
    setSourceIdInput(val.toUpperCase().trim())
  }

  const handleTargetIdChange = (val: string) => {
    setTargetIdInput(val.toUpperCase().trim())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canExecute || !sourceAccount || !targetAccount) return

    const finalRefId = referenceId.trim() || generateReferenceId('other_account')

    transferMutation.mutate(
      {
        source_account_id: sourceAccount.id,
        dest_account_id: targetAccount.id,
        amount: numAmount,
        reference_id: finalRefId,
        description: description.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          closeAllModals()
          openCompletion({
            status: 'success',
            type: 'transfer',
            title: 'Transfer Completed',
            amount: numAmount,
            sourceAccountName: sourceAccount.name,
            sourceAccountId: sourceAccount.id,
            destAccountName: targetAccount.name,
            destAccountId: targetAccount.id,
            referenceId: result?.reference_id || finalRefId,
            description: description.trim() || 'Inter-account transfer',
            timestamp: new Date().toISOString(),
          })
        },
        onError: (err: any) => {
          closeAllModals()
          const userMsg = mapSupabaseError(err)
          openCompletion({
            status: 'failed',
            type: 'transfer',
            title: 'Transfer Failed',
            errorMessage: userMsg,
            amount: numAmount,
            sourceAccountName: sourceAccount.name,
            sourceAccountId: sourceAccount.id,
            destAccountName: targetAccount.name,
            destAccountId: targetAccount.id,
            referenceId: finalRefId,
            description: description.trim() || 'Inter-account transfer',
            currentBalance: Number(sourceAccount.balance),
            timestamp: new Date().toISOString(),
          })
        },
      }
    )
  }

  return (
    <Dialog
      open={modals.isTransferOpen}
      onClose={closeAllModals}
      title="Transfer Funds"
      description="Verify source & target account IDs and holder names before making the transaction."
    >
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Source Account ID Input + Name Verification */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Source Account ID (Debit)
          </label>

          <div className="relative">
            <input
              type="text"
              value={sourceIdInput}
              onChange={(e) => handleSourceIdChange(e.target.value)}
              placeholder="e.g. AC107K9P"
              maxLength={8}
              className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl border text-sm text-[#141b2b] font-mono tracking-wider uppercase bg-white focus:outline-none focus:ring-2 transition-all ${
                sourceIdInput.length >= 8 && !isSourceVerified
                  ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20 focus:border-[#ba1a1a]'
                  : isSourceVerified
                  ? 'border-[#006a4e] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
                  : 'border-[#e5e7eb] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
              }`}
            />
            {isSourceVerified && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#006a4e] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#006a4e]" />
                <span className="hidden sm:inline">Verified</span>
              </div>
            )}
          </div>

          {/* Verified Source Name Badge / Warning */}
          {isSourceVerified && sourceAccount ? (
            <div className="mt-1.5 p-2 sm:p-2.5 rounded-xl bg-[#f0fdf4] border border-[#8af5be] flex items-center gap-2.5 animate-in fade-in duration-200">
              <div className="w-6 h-6 rounded-full bg-[#d1fae5] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-[#006a4e]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#00503a] truncate">
                    {sourceAccount.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#d1fae5] text-[#006a4e] shrink-0 uppercase tracking-wide">
                    DEBIT FROM
                  </span>
                </div>
                <p className="text-[11px] text-[#006a4e]/90 font-medium mt-0.5">
                  Available: {formatINR(sourceAccount.balance)}
                </p>
              </div>
            </div>
          ) : sourceIdInput.length >= 8 ? (
            <div className="mt-1.5 p-2 rounded-xl bg-[#fff5f5] border border-[#ba1a1a]/30 flex items-center gap-2 text-[#ba1a1a] text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Source account not found in ledger registry.</span>
            </div>
          ) : (
            <p className="text-[11px] text-[#6b7280] mt-1">
              Enter the 8-character Source Account ID to verify holder name.
            </p>
          )}
        </div>

        {/* Target Account ID Input + Name Verification */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Target Account ID (Credit)
          </label>

          <div className="relative">
            <input
              type="text"
              value={targetIdInput}
              onChange={(e) => handleTargetIdChange(e.target.value)}
              placeholder="e.g. AC103X8D"
              maxLength={8}
              className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl border text-sm text-[#141b2b] font-mono tracking-wider uppercase bg-white focus:outline-none focus:ring-2 transition-all ${
                isSameAccount || (targetIdInput.length >= 8 && !isTargetVerified)
                  ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20 focus:border-[#ba1a1a]'
                  : isTargetVerified
                  ? 'border-[#006a4e] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
                  : 'border-[#e5e7eb] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
              }`}
            />
            {isTargetVerified && !isSameAccount && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#006a4e] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#006a4e]" />
                <span className="hidden sm:inline">Verified</span>
              </div>
            )}
          </div>

          {/* Verified Target Name Badge / Warning */}
          {isSameAccount ? (
            <div className="mt-1.5 p-2 rounded-xl bg-[#fff5f5] border border-[#ba1a1a]/30 flex items-center gap-2 text-[#ba1a1a] text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Target account cannot be the same as the source account.</span>
            </div>
          ) : isTargetVerified && targetAccount ? (
            <div className="mt-1.5 p-2 sm:p-2.5 rounded-xl bg-[#f0fdf4] border border-[#8af5be] flex items-center gap-2.5 animate-in fade-in duration-200">
              <div className="w-6 h-6 rounded-full bg-[#d1fae5] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-[#006a4e]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#00503a] truncate">
                    {targetAccount.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#d1fae5] text-[#006a4e] shrink-0 uppercase tracking-wide">
                    CREDIT TO
                  </span>
                </div>
                <p className="text-[11px] text-[#006a4e]/90 font-medium mt-0.5">
                  Ready to receive transfer
                </p>
              </div>
            </div>
          ) : targetIdInput.length >= 8 ? (
            <div className="mt-1.5 p-2 rounded-xl bg-[#fff5f5] border border-[#ba1a1a]/30 flex items-center gap-2 text-[#ba1a1a] text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Target account not found in ledger registry.</span>
            </div>
          ) : (
            <p className="text-[11px] text-[#6b7280] mt-1">
              Enter the 8-character Target Account ID to verify recipient name.
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Transfer Amount ({CURRENCY_SYMBOL} {CURRENCY_CODE})
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
          {isInsufficientFunds && sourceAccount && (
            <p className="text-xs text-[#ba1a1a] mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Insufficient funds! Available balance is {formatINR(sourceAccount.balance)}.
              </span>
            </p>
          )}
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Inter-treasury reserve replenishment"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#141b2b] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] transition-all"
          />
        </div>

        {/* Reference ID */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Transfer Reference ID
          </label>
          <input
            type="text"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. OTHERACC395812"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#141b2b] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] transition-all font-mono text-xs"
          />
        </div>

        {/* Form Actions */}
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
            {transferMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="w-4 h-4" />
            )}
            Make Transaction
          </button>
        </div>
      </form>
    </Dialog>
  )
}
