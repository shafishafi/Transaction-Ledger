/**
 * Reference ID Generator
 * Generates simple, clean, and easily understandable reference IDs for ledger tracking:
 * - Internal Transactions (Single-account deposit/withdrawal): INTTXNXXXXXX
 * - Inter-Account Transfers: OTHERACCXXXXXX (with dr/cr suffix on posted legs)
 */
export function generateReferenceId(type: 'internal' | 'other_account' = 'internal'): string {
  const code = Math.floor(100000 + Math.random() * 900000)
  if (type === 'other_account') {
    return `OTHERACC${code}`
  }
  return `INTTXN${code}`
}

/**
 * Cleans and transforms any legacy reference ID into the strict hyphen-free format:
 * - 'INT-TXN-101004' -> 'INTTXN101004'
 * - 'OTHER-ACC-202001-debit' -> 'OTHERACC202001dr'
 * - 'OTHER-ACC-202001' -> 'OTHERACC202001'
 */
export function formatCleanReferenceId(ref?: string | null): string {
  if (!ref) return ''
  return ref
    .replace(/INT-TXN-/gi, 'INTTXN')
    .replace(/OTHER-ACC-/gi, 'OTHERACC')
    .replace(/-debit/gi, 'dr')
    .replace(/-credit/gi, 'cr')
    .replace(/INT-TXN/gi, 'INTTXN')
    .replace(/OTHER-ACC/gi, 'OTHERACC')
}

