import React from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  containerClassName?: string
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(({
  label,
  error,
  options,
  containerClassName = '',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : Math.random().toString(36).substr(2, 9))

  const baseStyles = 'appearance-none w-full px-5 py-4 bg-surface-50 dark:bg-surface-900 border-2 border-transparent border-b-surface-200 dark:border-b-surface-800 focus:border-primary-500/50 focus:bg-white dark:focus:bg-surface-950 focus:shadow-xl focus:ring-4 focus:ring-primary-500/5 transition-all outline-none text-sm font-semibold text-surface-800 dark:text-white rounded-2xl'
  
  const errorStyles = error ? 'border-b-red-500/60 focus:border-red-500/80 focus:ring-red-500/10' : ''

  return (
    <div className={`space-y-2 group ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-xs font-black uppercase tracking-widest text-surface-500 dark:text-surface-400 pl-1 group-focus-within:text-primary-500 transition-colors"
        >
          {label}
        </label>
      )}
      
      <div className="relative group/select">
        <select
          id={selectId}
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-xl text-surface-400 group-focus-within/select:text-primary-500 group-hover/select:translate-y-[-40%] transition-transform">
          <RiArrowDownSLine />
        </div>
      </div>

      {error && (
        <p className="text-[11px] font-bold text-red-500/90 pl-1 animate-fade-in">{error}</p>
      )}
    </div>
  )
})
