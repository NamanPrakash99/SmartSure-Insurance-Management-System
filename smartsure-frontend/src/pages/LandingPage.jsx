import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  RiShieldCheckFill,
  RiArrowRightLine,
  RiUser3Line,
} from 'react-icons/ri'

export default function LandingPage() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-surface-950">
      {/* Left Side: Branding (Equal Split but Small Content) */}
      <div className="lg:w-1/2 relative flex items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-primary-700 to-indigo-800">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-white blur-[100px]"></div>
          <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-accent-400 blur-[130px]"></div>
        </div>

        <div className="relative z-10 text-center flex flex-col items-center">
           <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 mb-6 shadow-2xl">
              <RiShieldCheckFill className="text-white text-3xl" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
             Smart<span className="text-primary-200">Sure</span>
           </h1>
           <p className="text-sm md:text-base text-primary-50/70 font-medium max-w-[280px] leading-relaxed">
             Enterprise-grade insurance management, simplified for you.
           </p>
        </div>
      </div>

      {/* Right Side: Primary CTA (Always White) */}
      <div className="lg:w-1/2 relative bg-white flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24">
         <div className="w-full max-w-sm">
            <div className="mb-10 text-center">
               <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Welcome Back</h2>
               <p className="mt-2 text-surface-500">Please access your dashboard to continue.</p>
            </div>

            {/* Login Primary CTA */}
            <Link to="/login" className="group block p-1 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-400 hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-300 transform active:scale-95">
               <div className="bg-white rounded-[14px] p-6 flex items-center justify-between group-hover:bg-transparent transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 group-hover:text-white transition-colors">
                        <RiUser3Line className="text-2xl" />
                     </div>
                     <span className="text-lg font-bold text-surface-900 group-hover:text-white transition-colors">Login to Dashboard</span>
                  </div>
                  <RiArrowRightLine className="text-xl text-surface-400 group-hover:text-white transition-colors" />
               </div>
            </Link>

            {/* Simple Signup Link below Login */}
            <div className="mt-6 text-center">
               <p className="text-sm text-surface-500 font-medium">
                 Don't have an account? {' '}
                 <Link to="/register" className="text-primary-600 font-bold hover:text-primary-800 transition-colors border-b border-primary-500/30 hover:border-primary-600">
                   Register now
                 </Link>
               </p>
            </div>



            <div className="mt-12 text-center text-[10px] text-surface-300 uppercase tracking-[4px] font-bold">
               Secure • Intelligent • Fast
            </div>
         </div>
      </div>
    </div>
  )
}



