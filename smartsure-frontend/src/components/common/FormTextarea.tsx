import React from 'react'
import { RiErrorWarningLine } from 'react-icons/ri'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
  leftIcon?: React.ReactNode
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(({
  label,
  error,
  helperText,
  containerClassName = '',
  className = '',
  leftIcon,
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : Math.random().toString(36).substr(2, 9))

  const baseStyles = 'w-full px-5 py-4 bg-surface-50 dark:bg-surface-900 border-2 border-transparent border-b-surface-200 dark:border-b-surface-800 focus:border-primary-500/50 dark:focus:border-primary-500/40 focus:bg-white dark:focus:bg-surface-950 focus:shadow-xl focus:shadow-primary-500/5 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none text-sm font-semibold text-surface-800 dark:text-white rounded-2xl resize-none'
  
  const errorStyles = error ? 'border-b-red-500/60 focus:border-red-500/80 focus:ring-red-500/10' : ''
  const iconStyles = leftIcon ? '!pl-12' : ''

  return (
    <div className={`space-y-2 group ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-xs font-black uppercase tracking-widest text-surface-500 dark:text-surface-400 pl-1 group-focus-within:text-primary-500 transition-colors"
        >
          {label}
        </label>
      )}
      
      <div className="relative group/input">
        {leftIcon && (
          <div className="absolute left-4 top-4 text-surface-400 group-focus-within/input:text-primary-500 transition-colors">
            {leftIcon}
          </div>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${iconStyles} ${className}`}
          {...props}
        />
      </div>

      {(error || helperText) && (
        <div className="flex items-center gap-1.5 pl-2">
          {error ? (
            <>
              <RiErrorWarningLine className="text-red-500 shrink-0" />
              <p className="text-[11px] font-bold text-red-500/90 animate-fade-in">{error}</p>
            </>
          ) : (
            <p className="text-[11px] font-medium text-surface-500/80">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
})
