import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '../../api/authService'
import {
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
  RegisterStep1Input,
  RegisterStep2Input,
  RegisterStep3Input,
} from '../../schemas/authSchema'
import { toast } from 'react-toastify'
import { RiShieldCheckFill } from 'react-icons/ri'

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Details
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // --- Step 1 Form ---
  const step1 = useForm<RegisterStep1Input>({
    resolver: zodResolver(registerStep1Schema),
  })

  // --- Step 2 Form ---
  const step2 = useForm<RegisterStep2Input>({
    resolver: zodResolver(registerStep2Schema),
  })

  // --- Step 3 Form ---
  const step3 = useForm<RegisterStep3Input>({
    resolver: zodResolver(registerStep3Schema),
  })

  const handleSendOtp = async (data: RegisterStep1Input) => {
    setLoading(true)
    const response = await authService.sendOtp(data.email)
    if (response.success) {
      toast.success('OTP sent to your email!')
      setStep(2)
    } else {
      toast.error(response.message)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (data: RegisterStep2Input) => {
    setLoading(true)
    const email = step1.getValues('email')
    const response = await authService.verifyOtp(email, data.otp)
    if (response.success) {
      toast.success('Email verified successfully!')
      setStep(3)
    } else {
      toast.error(response.message)
    }
    setLoading(false)
  }

  const handleRegister = async (data: RegisterStep3Input) => {
    setLoading(true)
    const email = step1.getValues('email')
    const response = await authService.register({ ...data, email })
    if (response.success) {
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } else {
      toast.error(response.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md card-glass p-8 relative z-10 animate-fade-in m-auto mt-[10vh]">
        <div className="flex flex-col items-center mb-8">
          <Link
            to="/"
            className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30"
          >
            <RiShieldCheckFill className="text-white text-2xl" />
          </Link>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Create Account</h2>
          <div className="flex gap-2 mt-4 w-full px-8">
            <div
              className={`h-1 flex-1 rounded-full ${
                step >= 1 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
              }`}
            ></div>
            <div
              className={`h-1 flex-1 rounded-full ${
                step >= 2 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
              }`}
            ></div>
            <div
              className={`h-1 flex-1 rounded-full ${
                step >= 3 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
              }`}
            ></div>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={step1.handleSubmit(handleSendOtp)} className="space-y-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1 text-surface-900 dark:text-surface-100">
                Step 1: Enter your email
              </label>
              <input
                type="email"
                {...step1.register('email')}
                className={`input-field ${
                  step1.formState.errors.email ? 'border-red-500 focus:ring-red-500/20' : ''
                }`}
                placeholder="name@example.com"
              />
              {step1.formState.errors.email && (
                <p className="mt-1 ml-1 text-xs text-red-500">
                  {step1.formState.errors.email.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex justify-center items-center"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Send Verification OTP'
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={step2.handleSubmit(handleVerifyOtp)} className="space-y-4 animate-slide-up">
            <div className="text-center mb-4">
              <p className="text-sm text-surface-600 dark:text-surface-400">
                OTP sent to:{' '}
                <strong className="text-surface-900 dark:text-white">
                  {step1.getValues('email')}
                </strong>
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-primary-600 hover:underline mt-1"
              >
                Change email
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1 text-surface-900 dark:text-surface-100">
                Step 2: Enter OTP
              </label>
              <input
                type="text"
                {...step2.register('otp')}
                className={`input-field text-center tracking-widest text-lg font-mono font-bold ${
                  step2.formState.errors.otp ? 'border-red-500 focus:ring-red-500/20' : ''
                }`}
                placeholder="------"
                maxLength={6}
              />
              {step2.formState.errors.otp && (
                <p className="mt-1 ml-1 text-xs text-red-500 text-center">
                  {step2.formState.errors.otp.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex justify-center items-center"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={step3.handleSubmit(handleRegister)} className="space-y-4 animate-slide-up">
            <p className="text-sm font-medium mb-4 text-center text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                ✓
              </span>{' '}
              Email verified
            </p>
            <div>
              <label className="block text-sm font-medium mb-1 text-surface-900 dark:text-surface-100">
                Full Name
              </label>
              <input
                type="text"
                {...step3.register('name')}
                className={`input-field !py-2.5 ${
                  step3.formState.errors.name ? 'border-red-500 focus:ring-red-500/20' : ''
                }`}
                placeholder="John Doe"
              />
              {step3.formState.errors.name && (
                <p className="mt-1 ml-1 text-xs text-red-500">{step3.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-surface-900 dark:text-surface-100">
                Password
              </label>
              <input
                type="password"
                {...step3.register('password')}
                className={`input-field !py-2.5 ${
                  step3.formState.errors.password ? 'border-red-500 focus:ring-red-500/20' : ''
                }`}
                placeholder="••••••••"
              />
              {step3.formState.errors.password && (
                <p className="mt-1 ml-1 text-xs text-red-500">
                  {step3.formState.errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-surface-900 dark:text-surface-100">
                Phone
              </label>
              <input
                type="tel"
                {...step3.register('phone')}
                className={`input-field !py-2.5 ${
                  step3.formState.errors.phone ? 'border-red-500 focus:ring-red-500/20' : ''
                }`}
                placeholder="+1234567890"
              />
              {step3.formState.errors.phone && (
                <p className="mt-1 ml-1 text-xs text-red-500">
                  {step3.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-surface-900 dark:text-surface-100">
                Address
              </label>
              <textarea
                {...step3.register('address')}
                className={`input-field !py-2.5 resize-none h-20 ${
                  step3.formState.errors.address ? 'border-red-500 focus:ring-red-500/20' : ''
                }`}
                placeholder="Your residential address"
              ></textarea>
              {step3.formState.errors.address && (
                <p className="mt-1 ml-1 text-xs text-red-500">
                  {step3.formState.errors.address.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-2 flex justify-center items-center"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
}
