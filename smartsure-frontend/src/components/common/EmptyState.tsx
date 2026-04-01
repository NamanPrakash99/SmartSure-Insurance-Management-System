import { Link } from 'react-router-dom'
import { HiOutlineDocumentSearch } from 'react-icons/hi'

export function EmptyState({ 
  icon: Icon = HiOutlineDocumentSearch, 
  title = 'Nothing here yet', 
  description = 'No data to display at this time.', 
  actionLabel, 
  actionTo 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-3xl flex items-center justify-center mb-6 border border-surface-200 dark:border-surface-700">
        <Icon className="text-3xl text-surface-400 dark:text-surface-500" />
      </div>
      <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
