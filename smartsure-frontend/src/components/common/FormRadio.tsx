import React from 'react'

interface FormRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string
  containerClassName?: string
}

export const FormRadio = React.forwardRef<HTMLInputElement, FormRadioProps>(({
  label,
  description,
  error,
  containerClassName = '',
  className = '',
  id,
  ...props
}, ref) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      <label className="flex items-center gap-4 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            id={radioId}
            type="radio"
            ref={ref}
            className={`
              peer appearance-none w-5 h-5 rounded-full border-2 
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
          <div className="absolute w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <div className="min-w-0">
          <span className="block text-sm font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {label}
          </span>
          {description && (
            <p className="text-xs text-surface-500 font-medium mt-0.5">{description}</p>
          )}
        </div>
      </label>
      {error && <p className="text-[11px] font-bold text-red-500 pl-9">{error}</p>}
    </div>
  )
})
