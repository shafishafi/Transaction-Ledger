import { Link, useLocation } from '@tanstack/react-router'
import {
  Wallet,
  ArrowRightLeft,
  PlusCircle,
  Building2,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  X,
  Search,
} from 'lucide-react'
import { useAccounts } from '@/hooks/use-accounts'
import { useAppStore } from '@/store/app-store'
import { isConfigured } from '@/lib/supabase'

export function Sidebar() {
  const location = useLocation()
  const { data: accounts } = useAccounts()
  const {
    isSidebarOpen,
    setSidebarOpen,
    openCreateAccount,
    openAddTransaction,
    openTransfer,
    openCheckBalance,
    activeAccountId,
    setActiveAccountId,
  } = useAppStore()

  const totalAccountsCount = accounts?.length ?? 0
  const selectedAccount = accounts?.find((a) => a.id === activeAccountId)

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-[260px] h-screen bg-white border-r border-[#e5e7eb] flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand / Logo + Mobile Close */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#f1f5f9]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006a4e] to-[#004d38] flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-[#141b2b] leading-tight">
                  Transaction Ledger
                </h1>
                <p className="text-[11px] font-semibold text-[#006c47] tracking-wider uppercase">
                  Financial System
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold text-[#6f7a73] tracking-widest uppercase mb-2">
                Core Ledgers
              </p>
              <nav className="space-y-1">
                <Link
                  to="/accounts"
                  onClick={() => {
                    setActiveAccountId(null)
                    setSidebarOpen(false)
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === '/accounts' || location.pathname === '/'
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4" />
                    <span>Accounts</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      location.pathname === '/accounts' || location.pathname === '/'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#f3f4f6] text-[#374151]'
                    }`}
                  >
                    {totalAccountsCount}
                  </span>
                </Link>
              </nav>
            </div>

            {/* Quick Actions */}
            <div>
              <p className="px-3 text-[11px] font-bold text-[#6f7a73] tracking-widest uppercase mb-2">
                Operations
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    openCheckBalance()
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#3f4944] hover:bg-[#f3f4f6] hover:text-[#111827] transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-[#006a4e]" />
                    <span>Check Balance</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    openCreateAccount()
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#3f4944] hover:bg-[#f3f4f6] hover:text-[#111827] transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-[#006a4e]" />
                    <span>New Account</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
                </button>

                {/* Only display Post Transaction if an account is selected */}
                {selectedAccount && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false)
                      openAddTransaction()
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#3f4944] hover:bg-[#f3f4f6] hover:text-[#111827] transition-all text-left animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-[#006a4e]" />
                      <span>Post Transaction</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setSidebarOpen(false)
                    openTransfer()
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#3f4944] hover:bg-[#f3f4f6] hover:text-[#111827] transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ArrowRightLeft className="w-4 h-4 text-[#006a4e]" />
                    <span>Transfer Funds</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security / Status Banner */}
        <div className="p-4 m-3 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck
              className={`w-4 h-4 shrink-0 ${isConfigured ? 'text-[#006a4e]' : 'text-[#d97706]'}`}
            />
            <p className="text-xs font-bold text-[#111827]">
              {isConfigured ? 'Supabase Live' : 'Demo Sandbox Engine'}
            </p>
          </div>
          <p className="text-[11px] text-[#6b7280] leading-relaxed">
            {isConfigured
              ? 'PostgreSQL atomicity & constraints active via Supabase cloud DB.'
              : 'Simulating PostgreSQL constraints (CHECK overdraft & UNIQUE ref).'}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isConfigured ? 'bg-[#00875a]' : 'bg-[#d97706]'
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isConfigured ? 'text-[#00875a]' : 'text-[#d97706]'
              }`}
            >
              {isConfigured ? 'Live PostgreSQL State' : 'Local Sandbox Mode'}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
