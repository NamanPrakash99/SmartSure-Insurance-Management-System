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
import { RiShieldCheckFill, RiMailLine, RiShieldKeyholeLine, RiUserLine, RiSmartphoneLine, RiLockPasswordLine } from 'react-icons/ri'
import { FormInput } from '../../components/common/FormInput'
import { FormTextarea } from '../../components/common/FormTextarea'
import { Button } from '../../components/common/Button'

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
          <form onSubmit={step1.handleSubmit(handleSendOtp)} className="space-y-6 animate-slide-up">
            <FormInput
              type="email"
              label="Step 1: Enter your email"
              leftIcon={<RiMailLine />}
              placeholder="name@example.com"
              error={step1.formState.errors.email?.message}
              {...step1.register('email')}
            />
            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              size="lg"
            >
              Send Verification OTP
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={step2.handleSubmit(handleVerifyOtp)} className="space-y-6 animate-slide-up">
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
                className="text-xs text-primary-600 hover:underline mt-1 font-bold uppercase tracking-widest"
              >
                Change email
              </button>
            </div>
            <FormInput
              type="text"
              label="Step 2: Enter OTP"
              leftIcon={<RiShieldKeyholeLine />}
              className="text-center tracking-[1em] text-lg font-mono font-bold pl-4 pr-4"
              placeholder="000000"
              maxLength={6}
              error={step2.formState.errors.otp?.message}
              {...step2.register('otp')}
            />
            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              size="lg"
            >
              Verify OTP
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={step3.handleSubmit(handleRegister)} className="space-y-5 animate-slide-up">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl flex items-center justify-center gap-3 border border-emerald-100 dark:border-emerald-500/20">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </span>{' '}
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Email verified successfully
              </p>
            </div>

            <FormInput
              label="Full Name"
              leftIcon={<RiUserLine />}
              placeholder="John Doe"
              error={step3.formState.errors.name?.message}
              {...step3.register('name')}
            />

            <FormInput
              type="password"
              label="Create Password"
              leftIcon={<RiLockPasswordLine />}
              placeholder="••••••••"
              error={step3.formState.errors.password?.message}
              {...step3.register('password')}
            />

            <FormInput
              type="tel"
              label="Phone Number"
              leftIcon={<RiSmartphoneLine />}
              placeholder="+1 234 567 890"
              error={step3.formState.errors.phone?.message}
              {...step3.register('phone')}
            />

            <FormTextarea
              label="Residential Address"
              placeholder="Enter your complete address..."
              error={step3.formState.errors.address?.message}
              rows={3}
              {...step3.register('address')}
            />

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              size="lg"
              className="mt-4"
            >
              Complete Registration
            </Button>
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
