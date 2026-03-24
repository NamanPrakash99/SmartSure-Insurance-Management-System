import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../api/authService'
import { toast } from 'react-toastify'
import { RiShieldCheckFill } from 'react-icons/ri'

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Details
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Form State
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phone: '',
    address: ''
  })

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.sendOtp(email)
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch (error) {
      toast.error(error.response?.data || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.verifyOtp(email, otp)
      toast.success('Email verified successfully!')
      setStep(3)
    } catch (error) {
      toast.error(error.response?.data || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    // Password Validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    if (!/\d/.test(formData.password)) {
      toast.error('Password must contain at least one number')
      return
    }

    setLoading(true)
    try {
      await authService.register({ ...formData, email })
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md card-glass p-8 relative z-10 animate-fade-in m-auto mt-[10vh]">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
            <RiShieldCheckFill className="text-white text-2xl" />
          </Link>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Create Account</h2>
          <div className="flex gap-2 mt-4 w-full px-8">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`}></div>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1 text-surface-900 dark:text-surface-100">Step 1: Enter your email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex justify-center items-center">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-slide-up">
            <div className="text-center mb-4">
              <p className="text-sm text-surface-600 dark:text-surface-400">OTP sent to: <strong className="text-surface-900 dark:text-white">{email}</strong></p>
              <button type="button" onClick={() => setStep(1)} className="text-xs text-primary-600 hover:underline mt-1">Change email</button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1 text-surface-900 dark:text-surface-100">Step 2: Enter OTP</label>
              <input
                type="text"
                required
                className="input-field text-center tracking-widest text-lg font-mono font-bold"
                placeholder="------"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex justify-center items-center">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4 animate-slide-up">
            <p className="text-sm font-medium mb-4 text-center text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">✓</span> Email verified
            </p>
            <div>
              <label className="block text-sm font-medium mb-1 text-surface-900 dark:text-surface-100">Full Name</label>
              <input type="text" required className="input-field !py-2.5" placeholder="John Doe"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-surface-900 dark:text-surface-100">Password</label>
              <input type="password" required className="input-field !py-2.5" placeholder="••••••••"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-surface-900 dark:text-surface-100">Phone</label>
              <input type="tel" required className="input-field !py-2.5" placeholder="+1234567890"
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-surface-900 dark:text-surface-100">Address</label>
              <textarea required className="input-field !py-2.5 resize-none h-20" placeholder="Your residential address"
                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-2 flex justify-center items-center">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Complete Registration'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
}
