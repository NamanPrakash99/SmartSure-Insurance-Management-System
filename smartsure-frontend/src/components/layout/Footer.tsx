import { RiShieldCheckLine, RiFacebookFill, RiTwitterFill, RiLinkedinFill, RiInstagramFill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-surface-200/80 dark:border-surface-800/60 bg-white dark:bg-surface-950 overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-primary-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                <RiShieldCheckLine className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold text-surface-900 dark:text-white">
                Smart<span className="gradient-text">Sure</span>
              </span>
            </Link>
            <p className="text-sm text-surface-500 font-medium leading-relaxed">
              Premium insurance management for individuals and enterprises. Protecting your future with smart, digital solutions.
            </p>
            <div className="flex items-center gap-4">
              {[RiFacebookFill, RiTwitterFill, RiLinkedinFill, RiInstagramFill].map((Icon, idx) => (
                <button key={idx} className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-primary-500 hover:bg-primary-500/10 transition-colors">
                  <Icon className="text-base" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-surface-400 uppercase tracking-widest">Platform</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/policies', label: 'All Policies' },
                { to: '/login', label: 'Dashboard' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-surface-400 uppercase tracking-widest">Company</h3>
            <ul className="space-y-3">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/terms', label: 'Terms & Conditions' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-surface-400 uppercase tracking-widest">Support</h3>
            <ul className="space-y-3">
              <li className="text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors cursor-pointer">Support Center</li>
              <li className="text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors cursor-pointer">Privacy Policy</li>
              <li className="text-sm font-bold text-surface-500 hover:text-primary-500 transition-colors cursor-pointer">Help FAQ</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-surface-100 dark:border-surface-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-surface-400">
            <RiShieldCheckLine className="text-primary-500 text-lg" />
            <span className="text-[10px] font-black uppercase tracking-[3px]">
              Secure • Fast • Simple
            </span>
          </div>
          <p className="text-[11px] text-surface-400 font-bold uppercase tracking-widest">
            © {currentYear} SmartSure. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
