import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../api/authService'
import { toast } from 'react-toastify'
import { HiOutlineMail, HiOutlineArrowLeft } from 'react-icons/hi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setIsSent(true)
      toast.success('Recovery link sent successfully')
    } catch (error) {
      toast.error(error.response?.data || 'Failed to send recovery link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]" />
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="card-glass p-8 md:p-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-surface-500 hover:text-primary-500 text-sm font-semibold mb-8 transition-colors">
            <HiOutlineArrowLeft />
            Back to Login
          </Link>

          {!isSent ? (
            <>
              <h1 className="text-3xl font-black mb-2 tracking-tight">Recover Account</h1>
              <p className="text-surface-500 mb-8 font-medium">Enter your email and we'll send you a secure link to reset your password.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-surface-700 dark:text-surface-300">Email Address</label>
                  <div className="relative group">
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="email" 
                      required 
                      className="input-field !pl-11"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary !py-4 flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 active:scale-95 transition-transform"
                >
                  {loading ? 'Sending...' : 'Send Recovery Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
                <HiOutlineMail />
              </div>
              <h2 className="text-2xl font-bold mb-3">Check your Email</h2>
              <p className="text-surface-500 mb-8 leading-relaxed font-medium">
                We've sent a simulated recovery link to <span className="text-surface-900 dark:text-white font-black">{email}</span>. Click the link in the email to securely reset your password.
              </p>
              <button 
                onClick={() => setIsSent(false)}
                className="btn-secondary w-full"
              >
                Resend Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
