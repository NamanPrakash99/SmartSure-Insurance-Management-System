import { Link } from 'react-router-dom'
import { RiShieldCheckFill, RiArrowLeftLine } from 'react-icons/ri'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/30">
          <RiShieldCheckFill className="text-white text-4xl" />
        </div>

        <h1 className="text-8xl font-black text-surface-200 dark:text-surface-800 tracking-tighter mb-2">404</h1>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4 tracking-tight">Page Not Found</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <RiArrowLeftLine />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
