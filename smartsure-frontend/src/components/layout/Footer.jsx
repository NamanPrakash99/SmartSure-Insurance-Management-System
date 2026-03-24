import { RiShieldCheckLine } from 'react-icons/ri'

export default function Footer() {
  return (
    <footer className="border-t border-surface-200/80 dark:border-surface-800/60 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-surface-400">
            <RiShieldCheckLine className="text-primary-500 text-lg" />
            <span className="text-xs font-semibold tracking-wide">
              SmartSure Insurance Management System
            </span>
          </div>
          <p className="text-[11px] text-surface-400 font-medium">
            © {new Date().getFullYear()} SmartSure. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
