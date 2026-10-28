export const CURRENCY_SYMBOL = '₹'
export const CURRENCY_CODE = 'INR'

export function formatINR(
  amount: number | string,
  options?: { showSymbol?: boolean }
): string {
  const num = Number(amount || 0)
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return options?.showSymbol !== false ? `${CURRENCY_SYMBOL}${formatted}` : formatted
}

