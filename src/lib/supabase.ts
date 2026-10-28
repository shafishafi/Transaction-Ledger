import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function isValidSupabaseUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false
  if (url.includes('<') || url.includes('>')) return false
  if (url.includes('your-project-id')) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidSupabaseKey(key?: string): boolean {
  if (!key || typeof key !== 'string') return false
  if (key.includes('<') || key.includes('>')) return false
  if (key.includes('your-anon-key')) return false
  return key.trim().length > 10
}

export const isConfigured = isValidSupabaseUrl(rawUrl) && isValidSupabaseKey(rawKey)

// Create client safely without throwing at module load time
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(rawUrl!, rawKey!)
  : null
