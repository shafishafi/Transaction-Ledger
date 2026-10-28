import { z } from 'zod'

// ─── Account ────────────────────────────────────────────────────
export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be 100 characters or less')
    .trim(),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>

// ─── Transaction ────────────────────────────────────────────────
export const transactionSchema = z.object({
  account_id: z.string().min(1, 'Please select a valid account'),
  type: z.enum(['credit', 'debit'], {
    errorMap: () => ({ message: "Type must be 'credit' or 'debit'" }),
  }),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(1_000_000_000, 'Amount is unrealistically large'),
  description: z.string().max(255).optional(),
  reference_id: z
    .string()
    .min(1, 'Reference ID is required')
    .max(255, 'Reference ID is too long'),
})

export type TransactionInput = z.infer<typeof transactionSchema>

// ─── Transfer ───────────────────────────────────────────────────
export const transferSchema = z
  .object({
    source_account_id: z.string().min(1, 'Please select a valid source account'),
    dest_account_id: z.string().min(1, 'Please select a valid destination account'),
    amount: z
      .number({ invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be greater than 0')
      .max(1_000_000_000, 'Amount is unrealistically large'),
    reference_id: z
      .string()
      .min(1, 'Reference ID is required')
      .max(255, 'Reference ID is too long'),
  })
  .refine((data) => data.source_account_id !== data.dest_account_id, {
    message: 'Source and destination accounts must be different',
    path: ['dest_account_id'],
  })

export type TransferInput = z.infer<typeof transferSchema>

