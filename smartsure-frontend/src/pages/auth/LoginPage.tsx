import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '../../api/authService'
import { loginSchema, LoginInput } from '../../schemas/authSchema'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { RiShieldCheckFill } from 'react-icons/ri'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    const response = await authService.login(data)
    
    if (response.success) {
      toast.success('Login successful!')
      login(response.data)
    } else {
      toast.error(response.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-950 relative overflow-hidden text-surface-900 dark:text-gray-100">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md card-glass p-8 relative z-10 animate-fade-in text-surface-900 dark:text-white border-white/20 dark:border-white/10 m-auto mt-[10vh]">
        <div className="flex flex-col items-center mb-8">
          <Link
            to="/"
            className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30"
          >
            <RiShieldCheckFill className="text-white text-2xl" />
          </Link>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Sign in to manage your policies
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500/20' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 ml-1 text-xs font-medium text-red-500 animate-fade-in">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className={`input-field ${
                errors.password ? 'border-red-500 focus:ring-red-500/20' : ''
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 ml-1 text-xs font-medium text-red-500 animate-fade-in">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary-600 bg-surface-100 border-surface-300 dark:bg-surface-800 dark:border-surface-600 focus:ring-primary-500/50"
              />
              <span className="text-sm">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              data-testid="forgot-password-link"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 !text-base mt-2 flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
