import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalRecords: number
  pageSize: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationBarProps) {
  const currentLimit = limit || pageSize || 5
  const effectiveTotalPages = Math.max(1, totalPages)
  const activePage = Math.min(Math.max(1, currentPage), effectiveTotalPages)

  const start = totalRecords === 0 ? 0 : (activePage - 1) * currentLimit + 1
  const end = Math.min(activePage * currentLimit, totalRecords)

  // Generate 1-indexed page numbers
  const pageNumbers: number[] = []
  for (let i = 1; i <= effectiveTotalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-[#f3f4f6] bg-white rounded-b-2xl text-xs text-[#6b7280]">
      {/* Left: Record summary */}
      <div>
        Showing <span className="font-bold text-[#111827] font-mono-nums">{start}–{end}</span> of{' '}
        <span className="font-bold text-[#111827] font-mono-nums">{totalRecords}</span> records
      </div>

      {/* Right: Per-page selector & Page navigation */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 flex-wrap">
        {/* Limit Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#6b7280]">Per page:</span>
          <div className="relative">
            <select
              value={currentLimit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="appearance-none pl-2.5 pr-7 py-1 rounded-lg border border-[#e5e7eb] text-xs font-bold text-[#111827] bg-white hover:border-[#006a4e] focus:outline-none focus:ring-2 focus:ring-[#006a4e]/20 cursor-pointer transition-all"
              style={{ backgroundImage: 'none' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#6f7a73]">
              <ChevronDown className="w-3 h-3 text-[#6f7a73]" />
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-[#e5e7eb]" />

        {/* Page text */}
        <span className="text-[#6b7280] hidden md:inline">
          Page <strong className="text-[#111827] font-bold">{activePage}</strong> of{' '}
          <strong className="text-[#111827] font-bold">{effectiveTotalPages}</strong>
        </span>

        {/* Prev / Page Numbers / Next */}
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(activePage - 1)}
            disabled={activePage <= 1}
            className="w-8 h-8 rounded-full border border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous Page"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Pills */}
          {effectiveTotalPages > 1 && (
            <div className="flex items-center gap-1">
              {pageNumbers.slice(0, 5).map((page) => {
                const isCurrent = page === activePage
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[#006a4e] text-white shadow-xs'
                        : 'text-[#374151] hover:bg-[#f3f4f6] hover:text-[#111827]'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              {effectiveTotalPages > 5 && <span className="px-1 text-[#9ca3af]">...</span>}
            </div>
          )}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(activePage + 1)}
            disabled={activePage >= effectiveTotalPages}
            className="w-8 h-8 rounded-full border border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next Page"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
