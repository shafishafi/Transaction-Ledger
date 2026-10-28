// Maps Supabase / PostgreSQL error codes to user-facing toast messages

type SupabaseError = {
  code?: string
  message?: string
  details?: string
  hint?: string
}

export function mapSupabaseError(error: SupabaseError): string {
  const { code, message } = error

  switch (code) {
    // CHECK constraint violation
    case '23514':
      if (message?.toLowerCase().includes('balance')) {
        return 'Transaction Failed: Insufficient funds for this debit.'
      }
      if (message?.toLowerCase().includes('amount')) {
        return 'Validation Error: Amount must be greater than 0.'
      }
      if (message?.toLowerCase().includes('type')) {
        return "Validation Error: Transaction type must be 'credit' or 'debit'."
      }
      return 'Validation Error: Please check your input.'

    // UNIQUE constraint violation (duplicate reference_id)
    case '23505':
      return 'Duplicate Transaction: This reference ID has already been processed.'

    // FOREIGN KEY violation (invalid account_id)
    case '23503':
      return 'Error: Invalid Account ID. The account does not exist.'

    // NOT NULL violation
    case '23502':
      return 'Validation Error: Required fields are missing.'

    // Invalid input / custom RAISE EXCEPTION from RPC
    case '22023':
      return message ?? 'Validation Error: Invalid input provided.'

    // Row not found
    case 'PGRST116':
      return 'Error: Account not found. No ledger record exists for this account ID.'

    // Auth errors
    case '401':
      return 'Authentication Error: Please sign in to continue.'

    default:
      return message ?? 'An unexpected error occurred. Please try again.'
  }
}

