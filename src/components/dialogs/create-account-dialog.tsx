import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAccountSchema, type CreateAccountInput } from '@/lib/schemas'
import { useCreateAccount } from '@/hooks/use-accounts'
import { useAppStore } from '@/store/app-store'
import { Dialog } from '@/components/ui/dialog'
import { mapSupabaseError } from '@/lib/error-map'
import { Loader2 } from 'lucide-react'

export function CreateAccountDialog() {
  const { modals, closeAllModals, openCompletion } = useAppStore()
  const createAccount = useCreateAccount()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = (data: CreateAccountInput) => {
    createAccount.mutate(data, {
      onSuccess: (newAccount) => {
        reset()
        closeAllModals()
        openCompletion({
          status: 'success',
          type: 'account',
          title: 'Account Inception Complete',
          accountName: newAccount.name,
          accountId: newAccount.id,
          balance: Number(newAccount.balance || 0),
          timestamp: newAccount.created_at || new Date().toISOString(),
        })
      },
      onError: (err: any) => {
        closeAllModals()
        const userMsg = mapSupabaseError(err)
        openCompletion({
          status: 'failed',
          type: 'account',
          title: 'Account Creation Failed',
          errorMessage: userMsg,
          accountName: data.name,
          accountId: 'N/A',
          balance: 0,
          timestamp: new Date().toISOString(),
        })
      },
    })
  }

  return (
    <Dialog
      open={modals.isCreateAccountOpen}
      onClose={closeAllModals}
      title="Create New Account"
      description="Open a new balance tracking account in the ledger. Initial balance will start at ₹0.00."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6f7a73] mb-1.5">
            Account Holder / Name
          </label>
          <input
            {...register('name')}
            placeholder="e.g. Operating Treasury, John Doe"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#141b2b] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 focus:border-[#006a4e] transition-all"
          />
          {errors.name && (
            <p className="text-xs text-[#ba1a1a] mt-1.5 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-between text-xs">
          <span className="font-semibold text-[#6f7a73]">Initial Balance</span>
          <span className="font-bold text-[#141b2b] font-mono-nums">₹0.00 (System Default)</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeAllModals}
            className="px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm font-semibold text-[#3f4944] hover:bg-[#f3f4f6] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createAccount.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#005740] text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {createAccount.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </div>
      </form>
    </Dialog>
  )
}

