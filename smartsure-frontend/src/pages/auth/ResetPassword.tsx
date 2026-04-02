import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '../../api/authService'
import { resetPasswordSchema, ResetPasswordInput } from '../../schemas/authSchema'
import { toast } from 'react-toastify'
import { HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi'
import { RiLockPasswordLine } from 'react-icons/ri'
import { FormInput } from '../../components/common/FormInput'
import { Button } from '../../components/common/Button'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Token is required to access this page
  useEffect(() => {
    if (!token) {
      toast.error('Invalid token or expired link')
      navigate('/login')
    }
  }, [token, navigate])

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true)
    const response = await authService.resetPassword({ token, newPassword: data.password })
    if (response.success) {
      setIsSuccess(true)
      toast.success('Password updated successfully')
    } else {
      toast.error(response.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6 relative overflow-hidden">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(99,102,241,0.08),transparent_50%)]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="card-glass p-8 md:p-10">
          {!isSuccess ? (
            <>
              <h1 className="text-3xl font-black mb-2 tracking-tight">Create New Password</h1>
              <p className="text-surface-500 mb-8 font-medium italic">
                Make sure your account is secure with a strong password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormInput
                  type="password"
                  label="New Password"
                  leftIcon={<RiLockPasswordLine />}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <FormInput
                  type="password"
                  label="Confirm New Password"
                  leftIcon={<RiLockPasswordLine />}
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button
                  type="submit"
                  isLoading={loading}
                  fullWidth
                  size="lg"
                  className="mt-2"
                >
                  Update Password
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
                <HiOutlineCheckCircle />
              </div>
              <h2 className="text-2xl font-black mb-3">Password Updated</h2>
              <p className="text-surface-500 mb-8 leading-relaxed font-medium italic">
                Your security has been updated successfully. You can now use your new password to
                access SmartSure.
              </p>
              <Link to="/login" className="w-full">
                <Button fullWidth size="lg" leftIcon={<HiOutlineArrowLeft />}>
                  Log in securely
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
