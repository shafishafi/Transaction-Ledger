import { useState, useEffect } from 'react'
import { useAccounts } from '@/hooks/use-accounts'
import { useAppStore } from '@/store/app-store'
import { Dialog } from '@/components/ui/dialog'
import {
  Search,
  CheckCircle2,
  Check,
} from 'lucide-react'

export function CheckBalanceDialog() {
  const {
    modals,
    closeAllModals,
    activeAccountId,
    openCompletion,
  } = useAppStore()

  const { data: accounts } = useAccounts()

  const [accountIdInput, setAccountIdInput] = useState('')
  const [nameInput, setNameInput] = useState('')

  // Initialize or reset when modal opens
  useEffect(() => {
    if (modals.isCheckBalanceOpen) {
      if (activeAccountId && accounts) {
        const found = accounts.find((a) => a.id === activeAccountId)
        if (found) {
          setAccountIdInput(found.id)
          setNameInput(found.name)
          return
        }
      }
      setAccountIdInput('')
      setNameInput('')
    }
  }, [modals.isCheckBalanceOpen, activeAccountId, accounts])

  // Real-time lookup for holder name auto-detection only
  const matchedAccount = accounts?.find(
    (a) =>
      (accountIdInput.trim() !== '' &&
        a.id.toUpperCase() === accountIdInput.trim().toUpperCase()) ||
      (nameInput.trim() !== '' &&
        a.name.toLowerCase() === nameInput.trim().toLowerCase())
  )

  const handleIdChange = (value: string) => {
    const formatted = value.toUpperCase().trim()
    setAccountIdInput(formatted)

    // Lookup matching account name automatically
    const found = accounts?.find((a) => a.id.toUpperCase() === formatted)
    if (found) {
      setNameInput(found.name)
    } else {
      if (formatted.length < 8) {
        setNameInput('')
      }
    }
  }

  const handleNameChange = (value: string) => {
    setNameInput(value)

    const found = accounts?.find(
      (a) => a.name.toLowerCase() === value.trim().toLowerCase()
    )
    if (found) {
      setAccountIdInput(found.id)
    }
  }

  const handleManualCheck = (e: React.FormEvent) => {
    e.preventDefault()
    const formatted = accountIdInput.toUpperCase().trim()
    const queryName = nameInput.trim()

    if (!formatted && !queryName) return

    const found = accounts?.find(
      (a) =>
        a.id.toUpperCase() === formatted ||
        (queryName !== '' && a.name.toLowerCase() === queryName.toLowerCase())
    )

    // Close this inquiry input dialog
    closeAllModals()

    if (found) {
      // Display the balance data in the dedicated completion popup
      openCompletion({
        status: 'success',
        type: 'balance',
        title: 'Available Ledger Balance',
        accountName: found.name,
        accountId: found.id,
        balance: Number(found.balance || 0),
        createdAt: found.created_at,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Display 404 error response popup
      openCompletion({
        status: 'failed',
        type: 'balance',
        title: 'Account Not Found',
        errorMessage: `Error: No ledger account exists with identifier "${formatted || queryName}". Status: 404 NOT FOUND (PGRST116 RECORD_NOT_FOUND).`,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <Dialog
      open={modals.isCheckBalanceOpen}
      onClose={closeAllModals}
      title="Check Account Balance"
      description="Inquire real-time ledger balance by Account ID or Name."
    >
      <form onSubmit={handleManualCheck} className="space-y-4">
        {/* Account ID Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Account ID (8-Character)
          </label>
          <div className="relative">
            <input
              type="text"
              value={accountIdInput}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder="e.g. AC107K9P"
              maxLength={8}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#141b2b] font-mono tracking-wider uppercase bg-white focus:outline-none focus:ring-2 transition-all ${
                matchedAccount
                  ? 'border-[#006a4e] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
                  : 'border-[#e5e7eb] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
              }`}
            />
            {matchedAccount && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#006a4e] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#006a4e]" />
                <span className="hidden sm:inline">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Account Holder Name (Auto-detected on ID Match) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Account Holder Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={
                accountIdInput
                  ? 'Name will appear automatically...'
                  : 'Enter Account ID above, or enter name to search'
              }
              className={`w-full px-3.5 py-2.5 ${matchedAccount ? 'pr-28' : ''} rounded-xl border text-sm font-semibold transition-all ${
                matchedAccount
                  ? 'bg-[#f0fdf4] border-[#8af5be] text-[#00503a]'
                  : 'bg-[#f8fafc] border-[#e5e7eb] text-[#141b2b]'
              }`}
            />
            {matchedAccount && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[11px] font-bold text-[#006a4e] bg-white px-2 py-0.5 rounded-md border border-[#8af5be]/60 shrink-0">
                <Check className="w-3 h-3 text-[#006a4e]" />
                Auto-Detected
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6b7280] mt-1">
            {matchedAccount
              ? 'Account holder verified against ledger registry'
              : 'Entering an 8-character Account ID automatically reveals the holder name.'}
          </p>
        </div>

        {/* Check Button */}
        <div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#005740] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Check Balance</span>
          </button>
        </div>

        {/* Modal Close Footer */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={closeAllModals}
            className="px-5 py-2 rounded-xl border border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#3f4944] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </form>
    </Dialog>
  )
}
