import { Menu, ShieldCheck } from 'lucide-react'
import { useAccounts } from '@/hooks/use-accounts'
import { useAppStore } from '@/store/app-store'
import { isConfigured } from '@/lib/supabase'

function getInitials(name?: string): string {
  if (!name) return 'TL'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function TopBar() {
  const { toggleSidebar, activeAccountId } = useAppStore()
  const { data: accounts } = useAccounts()

  // Dynamic selected account (only when an account is selected)
  const selectedAccount = activeAccountId
    ? accounts?.find((a) => a.id === activeAccountId)
    : undefined

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-[#e5e7eb] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
      {/* Left: Mobile Hamburger Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#006a4e] animate-pulse" />
          <span className="text-xs font-bold text-[#141b2b] uppercase tracking-wider">
            Treasury Ledger
          </span>
          <span className="text-[11px] font-medium text-[#6b7280] hidden sm:inline">
            • Real-Time PostgreSQL
          </span>
        </div>
      </div>

      {/* Right: Status Badge & Dynamic Selected Account Info */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8fafc] border border-[#e5e7eb] text-[11px] font-bold text-[#006a4e]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#006a4e]" />
          <span>{isConfigured ? 'PostgreSQL Live' : 'Sandbox Ledger'}</span>
        </div>

        {/* Selected Account Profile Display (No Dropdown) */}
        <div className="flex items-center gap-2">
          {/* Avatar Circle with Selected Account Initials */}
          <div className="w-8 h-8 rounded-full bg-[#006a4e] text-white font-extrabold text-xs flex items-center justify-center border border-white shadow-xs shrink-0">
            {getInitials(selectedAccount?.name)}
          </div>

          {/* Account Name & Authorized Subtitle */}
          <div className="hidden sm:block text-left max-w-[170px]">
            <span className="block text-xs font-bold text-[#141b2b] leading-tight truncate">
              {selectedAccount ? selectedAccount.name : 'Treasury Officer'}
            </span>
            <span className="block text-[10px] text-[#6b7280] leading-tight">
              Authorized
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
