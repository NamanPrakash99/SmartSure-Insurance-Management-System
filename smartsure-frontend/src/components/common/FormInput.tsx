import React, { useState } from 'react'
import { RiErrorWarningLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  helperText?: string
  containerClassName?: string
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  error,
  leftIcon,
  helperText,
  containerClassName = '',
  className = '',
  type = 'text',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : Math.random().toString(36).substr(2, 9))

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const baseStyles = 'w-full px-5 py-4 bg-surface-50 dark:bg-surface-900 border-2 border-transparent border-b-surface-200 dark:border-b-surface-800 focus:border-primary-500/50 dark:focus:border-primary-500/40 focus:bg-white dark:focus:bg-surface-950 focus:shadow-xl focus:shadow-primary-500/5 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none text-sm font-semibold text-surface-800 dark:text-white rounded-2xl'
  
  const errorStyles = error ? 'border-b-red-500/60 focus:border-red-500/80 focus:ring-red-500/10' : ''
  const iconPadding = leftIcon ? 'pl-14' : ''

  return (
    <div className={`space-y-2 group ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-black uppercase tracking-widest text-surface-500 dark:text-surface-400 pl-1 group-focus-within:text-primary-500 transition-colors"
        >
          {label}
        </label>
      )}
      
      <div className="relative group/input">
        {leftIcon && (
          <div className={`absolute left-5 top-1/2 -translate-y-1/2 text-xl transition-all duration-300 ${error ? 'text-red-500/60' : 'text-surface-400 group-focus-within/input:text-primary-500 group-focus-within/input:scale-110'}`}>
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`${baseStyles} ${errorStyles} ${iconPadding} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-surface-400 hover:text-primary-500 transition-colors"
          >
            {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        )}
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
