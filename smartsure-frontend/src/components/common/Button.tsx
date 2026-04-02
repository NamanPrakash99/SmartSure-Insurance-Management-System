import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-md shadow-primary-500/20 active:scale-[0.98]',
    secondary: 'bg-surface-100 text-surface-900 border border-surface-200 hover:bg-surface-200 dark:bg-surface-800 dark:text-white dark:border-surface-700 dark:hover:bg-surface-700',
    outline: 'bg-transparent border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10',
    ghost: 'bg-transparent text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-500/20 active:scale-[0.98]',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20 active:scale-[0.98]',
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg',
    sm: 'px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl',
    md: 'px-6 py-3 text-sm font-bold rounded-2xl',
    lg: 'px-8 py-4 text-base font-bold rounded-2xl',
    xl: 'px-10 py-5 text-lg font-extrabold rounded-[24px]',
  }

  const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 font-sans'
  
  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {leftIcon && <span className={`${children ? 'mr-2' : ''} transition-transform group-hover:scale-110`}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={`${children ? 'ml-2' : ''} transition-transform group-hover:scale-110`}>{rightIcon}</span>}
        </>
      )}
    </button>
  )
})
