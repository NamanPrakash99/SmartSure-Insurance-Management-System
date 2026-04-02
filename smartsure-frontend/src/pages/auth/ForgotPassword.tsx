import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '../../api/authService'
import { forgotPasswordSchema, ForgotPasswordInput } from '../../schemas/authSchema'
import { toast } from 'react-toastify'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { RiMailLine } from 'react-icons/ri'
import { FormInput } from '../../components/common/FormInput'
import { Button } from '../../components/common/Button'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true)
    const response = await authService.forgotPassword(data.email)
    if (response.success) {
      setIsSent(true)
      toast.success('Recovery link sent successfully')
    } else {
      toast.error(response.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="card-glass p-8 md:p-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-surface-500 hover:text-primary-500 text-sm font-semibold mb-8 transition-colors"
          >
            <HiOutlineArrowLeft />
            Back to Login
          </Link>

          {!isSent ? (
            <>
              <h1 className="text-3xl font-black mb-2 tracking-tight">Recover Account</h1>
              <p className="text-surface-500 mb-8 font-medium">
                Enter your email and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormInput
                  type="email"
                  label="Email Address"
                  leftIcon={<RiMailLine />}
                  placeholder="name@company.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  isLoading={loading}
                  fullWidth
                  size="lg"
                  className="mt-2 shadow-xl shadow-primary-500/20"
                >
                  Send Recovery Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
                <RiMailLine />
              </div>
              <h2 className="text-2xl font-bold mb-3">Check your Email</h2>
              <p className="text-surface-500 mb-8 leading-relaxed font-medium">
                We've sent a simulated recovery link to{' '}
                <span className="text-surface-900 dark:text-white font-black">
                  {getValues('email')}
                </span>
                . Click the link in the email to securely reset your password.
              </p>
              <Button 
                variant="secondary" 
                onClick={() => setIsSent(false)} 
                fullWidth
                size="lg"
              >
                Resend Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
