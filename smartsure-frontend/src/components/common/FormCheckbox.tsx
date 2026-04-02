import React from 'react'

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  containerClassName?: string
}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(({
  label,
  error,
  containerClassName = '',
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            className={`
              peer appearance-none w-5 h-5 rounded-md border-2 
              border-surface-200 dark:border-surface-700 
              bg-white dark:bg-surface-800
              checked:bg-primary-500 checked:border-primary-500
              focus:ring-2 focus:ring-primary-500/20
              transition-all duration-200 cursor-pointer
              ${error ? 'border-red-500/50' : 'group-hover:border-primary-500/50'}
              ${className}
            `}
            {...props}
          />
          <svg
            className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-medium text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">
          {label}
        </span>
      </label>
      {error && <p className="text-[11px] font-bold text-red-500 pl-8">{error}</p>}
    </div>
  )
})
