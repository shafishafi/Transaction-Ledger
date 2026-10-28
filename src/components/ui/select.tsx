import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border ${
            error
              ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/20 focus:border-[#ba1a1a]'
              : 'border-[#e5e7eb] focus:ring-[#006a4e]/20 focus:border-[#006a4e]'
          } text-sm text-[#141b2b] bg-white focus:outline-none focus:ring-2 transition-all cursor-pointer ${className}`}
          style={{ backgroundImage: 'none' }}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#6f7a73]">
          <ChevronDown className="w-4 h-4 text-[#6f7a73] shrink-0" />
        </div>
      </div>
    )
  }
)

Select.displayName = 'Select'

