import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../../api/authService'
import { toast } from 'react-toastify'
import { HiOutlineLockClosed, HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Token is required to access this page
  useEffect(() => {
    if (!token) {
      toast.error('Invalid token or expired link')
      navigate('/login')
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword({ token, newPassword })
      setIsSuccess(true)
      toast.success('Password updated successfully')
    } catch (error) {
      toast.error(error.response?.data || 'Reset failed')
    } finally {
      setLoading(false)
    }
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
              <p className="text-surface-500 mb-8 font-medium italic">Make sure your account is secure with a strong password.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-surface-700 dark:text-surface-300">New Password</label>
                  <div className="relative group">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="password" 
                      required 
                      className="input-field !pl-11"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-surface-700 dark:text-surface-300">Confirm New Password</label>
                  <div className="relative group">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="password" 
                      required 
                      className="input-field !pl-11"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary !py-4 flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 active:scale-95 transition-transform"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
                <HiOutlineCheckCircle />
              </div>
              <h2 className="text-2xl font-black mb-3">Password Updated</h2>
              <p className="text-surface-500 mb-8 leading-relaxed font-medium italic">Your security has been updated successfully. You can now use your new password to access SmartSure.</p>
              <Link 
                to="/login"
                className="btn-primary w-full shadow-lg flex items-center justify-center gap-2"
              >
                <HiOutlineArrowLeft />
                Log in securely
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
