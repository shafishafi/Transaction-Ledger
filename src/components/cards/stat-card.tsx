import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  isPositive?: boolean
  subtitle?: string
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
}: StatCardProps) {
  const isStringValue = typeof value === 'string' && value.length > 8
  const isId = typeof value === 'string' && value.startsWith('AC') && value.length === 8

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 card-shadow border border-[#f1f5f9] flex flex-col justify-between h-full hover:border-[#e2e8f0] transition-colors">
      <div>
        <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">
          {title}
        </p>
        <p
          className={`text-[#141b2b] mt-2 tracking-tight ${
            isId
              ? 'text-xl sm:text-2xl font-bold font-mono tracking-wider'
              : isStringValue
              ? 'text-lg sm:text-xl font-semibold'
              : 'text-2xl sm:text-3xl font-bold font-mono-nums'
          }`}
        >
          {value}
        </p>
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3.5 border-t border-[#f3f4f6] flex flex-wrap items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium px-2 py-0.5 rounded-full shrink-0 text-[11px] ${
                isPositive
                  ? 'bg-[#d1fae5] text-[#00875a]'
                  : 'bg-[#ffdad6] text-[#ba1a1a]'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-[#6b7280] text-[11px] sm:text-xs font-normal">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
