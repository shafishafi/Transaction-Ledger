import { supabase, isConfigured } from '@/lib/supabase'
import { mockAccountsService } from '@/lib/mock-data'
import type { CreateAccountInput } from '@/lib/schemas'
import type { Account } from '@/types'

export const accountsService = {
  async create(data: CreateAccountInput): Promise<Account> {
    if (!isConfigured || !supabase) {
      return mockAccountsService.create(data)
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({ name: data.name.trim() })
      .select('id, name, balance, created_at')
      .single()

    if (error) throw error
    return account as Account
  },

  async getAll(): Promise<Account[]> {
    if (!isConfigured || !supabase) {
      return mockAccountsService.getAll()
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, balance, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Account[]
  },

  async getById(id: string): Promise<Account> {
    if (!isConfigured || !supabase) {
      return mockAccountsService.getById(id)
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, balance, created_at')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Account
  },
}
