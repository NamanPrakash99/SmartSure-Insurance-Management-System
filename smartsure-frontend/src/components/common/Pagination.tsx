import { HiOutlineChevronDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
}

export const Pagination = ({ 
  currentPage = 1, 
  totalItems = 0, 
  itemsPerPage = 10, 
  onPageChange, 
  onItemsPerPageChange 
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  return (
    <div className="flex items-center justify-between w-full h-16 px-6 bg-white/5 dark:bg-surface-900/50 backdrop-blur-2xl border border-surface-200/50 dark:border-surface-800/50 animate-slide-up rounded-full shadow-xl relative overflow-hidden group mt-8 mb-2">
      {/* Structural Accent Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5 opacity-30"></div>
      
      {/* LEFT: Previous */}
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="relative z-10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-20 enabled:text-surface-700 dark:enabled:text-surface-300 enabled:hover:text-primary-500 active:scale-95 flex items-center gap-2 group/btn"
      >
        <HiChevronLeft className="text-lg transition-transform group-enabled:group-hover/btn:-translate-x-1" />
        <span className="hidden md:inline">Previous</span>
      </button>

      {/* CENTER: Navigation Pill */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center z-10">
        <div className="bg-surface-900 dark:bg-primary-500/10 px-6 py-2 rounded-full text-xs font-black ring-1 ring-white/10 dark:ring-primary-500/20 flex items-center gap-2 shadow-lg shadow-black/10">
          <span className="text-surface-500 uppercase tracking-widest text-[9px] font-black">Page</span>
          <div className="flex items-center gap-1.5 translate-y-[1px]">
            <span className="text-white dark:text-primary-400 tabular-nums text-sm">{currentPage}</span>
            <span className="text-surface-600 dark:text-surface-700 font-medium lowercase text-[10px]">of</span>
            <span className="text-surface-400 dark:text-surface-500 tabular-nums text-sm">{totalPages}</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Next & Show */}
      <div className="flex items-center gap-4 z-10">
        <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-surface-200/50 dark:border-surface-800/50">
          <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest opacity-60">Show:</p>
          <div className="relative group/select">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
              className="appearance-none bg-surface-100/50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50 rounded-full pl-3 pr-8 py-1.5 text-[10px] font-black text-surface-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700"
            >
              {[10, 20, 50, 100].map(val => (
                <option key={val} value={val} className="text-surface-900 font-sans font-bold">{val}</option>
              ))}
            </select>
            <HiOutlineChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none text-[10px]" />
          </div>
        </div>

        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-20 enabled:text-surface-700 dark:enabled:text-surface-300 enabled:hover:text-primary-500 active:scale-95 flex items-center gap-2 group/btn"
        >
          <span className="hidden md:inline">Next</span>
          <HiChevronRight className="text-lg transition-transform group-enabled:group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  )
}
