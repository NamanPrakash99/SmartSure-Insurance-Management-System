import { IconType } from 'react-icons'

interface PremiumStatsCardProps {
  title: string
  value: string | number
  icon: IconType
}

export function PremiumStatsCard({ title, value, icon: Icon }: PremiumStatsCardProps) {
  return (
    <div className="card-glass p-6 h-[140px] relative overflow-hidden group flex flex-col justify-center hover:border-primary-500/30 transition-all duration-500 shadow-2xl">
      {/* Dynamic Background Shape — Matches the Screenshot's circular curve precisely */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-700 pointer-events-none" />
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-surface-950/20 dark:bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-1000 ease-in-out pointer-events-none" />
      
      {/* The main circular sweep from the screenshot */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-surface-900/40 to-transparent dark:from-white/5 pointer-events-none rounded-l-full translate-x-12 scale-150 rotate-12 opacity-50" />

      <div className="flex items-center justify-between relative z-10 w-full px-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-surface-400 dark:text-surface-500 mb-2 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 overflow-hidden">
            <h4 className="text-4xl font-extrabold text-surface-900 dark:text-white truncate drop-shadow-sm">
               {value}
            </h4>
          </div>
        </div>
        
        {/* Sleek Icon Container — Matches the screenshot's hollow rounded square style */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-surface-200/50 dark:border-white/10 bg-white/5 backdrop-blur-md shadow-inner group-hover:scale-110 transition-all duration-500`}>
          <Icon className="text-2xl text-surface-700 dark:text-white opacity-90" />
        </div>
      </div>
    </div>
  )
}
