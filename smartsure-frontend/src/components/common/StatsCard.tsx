import { IconType } from 'react-icons'

interface StatsCardProps {
  title: string
  value: string | number
  icon: IconType
  trend?: string | number
  color?: 'green' | 'red' | 'amber' | 'blue' | 'indigo'
}

export function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  // Determine accent color for the icon background
  const colorMap = {
    green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
  }
  const iconStyle = color ? (colorMap[color as keyof typeof colorMap] || colorMap.blue) : 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-500/20'

  const isPositive = typeof trend === 'string' ? trend.startsWith('+') : (trend ? trend > 0 : false)
  const isNegative = typeof trend === 'string' ? trend.startsWith('-') : (trend ? trend < 0 : false)

  return (
    <div className="card p-5 h-[130px] relative overflow-hidden group flex flex-col justify-between hover:border-primary-500/30 transition-all duration-300">
      {/* Decorative gradient blob */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-500/5 dark:bg-primary-500/10 rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 overflow-hidden">
            <h4 className="text-2xl font-extrabold text-surface-900 dark:text-white truncate animate-count-up">
               {value}
            </h4>
            {trend !== undefined && trend !== 0 && trend !== '0' && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isPositive 
                  ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10' 
                  : isNegative
                    ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
                    : 'text-surface-500 bg-surface-50 dark:bg-surface-500/10'
              }`}>
                {trend}
              </span>
            )}
          </div>
        </div>
        
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconStyle}`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  )
}
