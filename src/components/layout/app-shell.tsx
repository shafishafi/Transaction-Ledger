import React from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { CreateAccountDialog } from '@/components/dialogs/create-account-dialog'
import { AddTransactionDialog } from '@/components/dialogs/add-transaction-dialog'
import { TransferDialog } from '@/components/dialogs/transfer-dialog'
import { CompletionDialog } from '@/components/dialogs/completion-dialog'
import { CheckBalanceDialog } from '@/components/dialogs/check-balance-dialog'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar with responsive slide-over drawer */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateAccountDialog />
      <AddTransactionDialog />
      <TransferDialog />
      <CompletionDialog />
      <CheckBalanceDialog />
    </div>
  )
}
