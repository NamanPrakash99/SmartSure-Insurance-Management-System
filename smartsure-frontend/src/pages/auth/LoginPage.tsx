import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '../../api/authService'
import { loginSchema, LoginInput } from '../../schemas/authSchema'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { RiShieldCheckFill, RiMailLine, RiLockPasswordLine } from 'react-icons/ri'
import { FormInput } from '../../components/common/FormInput'
import { FormCheckbox } from '../../components/common/FormCheckbox'
import { Button } from '../../components/common/Button'

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            type="email"
            label="Email Address"
            leftIcon={<RiMailLine />}
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <FormInput
            type="password"
            label="Password"
            leftIcon={<RiLockPasswordLine />}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between px-1">
            <FormCheckbox
              label="Remember me"
              containerClassName="cursor-pointer"
            />
            <Link
              to="/forgot-password"
              data-testid="forgot-password-link"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            size="lg"
            className="mt-4"
          >
            Sign In
          </Button>
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
