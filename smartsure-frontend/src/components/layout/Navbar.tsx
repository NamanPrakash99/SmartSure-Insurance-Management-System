import { Link, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { 
  HiOutlineMenu, 
  HiOutlineX, 
  HiOutlineChartBar, 
  HiOutlineCog, 
  HiOutlineDocumentText, 
  HiOutlineShieldCheck,
  HiOutlineViewGrid,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlinePresentationChartBar
} from 'react-icons/hi'
import { FiSun, FiMoon, FiLogOut, FiUser } from 'react-icons/fi'
import { RiShieldCheckLine } from 'react-icons/ri'
import { useState, useMemo } from 'react'
import { Button } from '../../components/common/Button'

import { IconType } from 'react-icons'

interface NavLinkItem {
  to: string
  label: string
  icon?: IconType
}

// Navigation Constants
const ADMIN_LINKS: NavLinkItem[] = [
  { to: '/admin/dashboard', icon: HiOutlineChartBar, label: 'Dashboard' },
  { to: '/admin/policies', icon: HiOutlineCog, label: 'Policies' },
  { to: '/admin/claims', icon: HiOutlineDocumentText, label: 'Claims' },
  { to: '/admin/user-policies', icon: HiOutlineCollection, label: 'Subscriptions' },
  { to: '/admin/reports', icon: HiOutlinePresentationChartBar, label: 'Reports' },
]

const CUSTOMER_LINKS: NavLinkItem[] = [
  { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { to: '/policies', icon: HiOutlineShieldCheck, label: 'Browse' },
  { to: '/my-policies', icon: HiOutlineCollection, label: 'My Policies' },
  { to: '/my-claims', icon: HiOutlineClipboardList, label: 'Claims Hub' },
]

const PUBLIC_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/terms', label: 'Terms' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isLanding = location.pathname === '/'

  const publicPaths = ['/', '/about', '/contact', '/terms']
  const isPublicPage = publicPaths.includes(location.pathname)

  const links = useMemo(() => {
    // If we're on a public page, show public links regardless of auth status
    if (isPublicPage) return PUBLIC_LINKS
    
    // Otherwise, show role-specific dashboard links
    if (!isAuthenticated) return PUBLIC_LINKS
    return isAdmin ? ADMIN_LINKS : CUSTOMER_LINKS
  }, [isAuthenticated, isAdmin, isPublicPage])

  const [showUserDropdown, setShowUserDropdown] = useState(false)

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      isLanding
        ? 'bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-surface-200/50 dark:border-surface-800/50'
        : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={!isAuthenticated ? "/" : (isAdmin ? "/admin/dashboard" : "/dashboard")} 
            className="flex items-center gap-2 group shrink-0"
          >

            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
              <RiShieldCheckLine className="text-white text-lg" />
            </div>
            <span className="hidden sm:block text-xl font-bold text-surface-900 dark:text-white">
              Smart<span className="gradient-text">Sure</span>
            </span>
          </Link>

          {/* Centered Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 mx-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/' || link.to === '/dashboard' || link.to === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`
                  }
                >
                  {link.icon && <link.icon className="text-xl" />}
                  <span className="whitespace-nowrap">{link.label}</span>
                </NavLink>
              ))}
            </div>

          {/* Desktop nav right-side (Theme + Auth) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Theme toggle */}
            <Button
              variant="secondary"
              onClick={toggleTheme}
              className="w-10 h-10 !p-0"
              aria-label="Toggle theme"
              id="theme-toggle"
              leftIcon={isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
            />

            {isPublicPage ? (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary text-sm !px-4 !py-2">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">
                  Sign Up
                </Link>
              </div>
            ) : (
              isAuthenticated && (
                <div className="relative">
                  <Button 
                    variant="secondary"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`gap-2 !px-3 !py-1.5 ${
                      showUserDropdown 
                        ? 'ring-2 ring-primary-500/10 border-primary-500/30' 
                        : ''
                    }`}
                    leftIcon={
                      <div className="w-6 h-6 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <FiUser className="text-primary-600 dark:text-primary-400 text-xs" />
                      </div>
                    }
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {user?.name || user?.role}
                    </span>
                  </Button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setShowUserDropdown(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-modal-slide-up origin-top-right">
                       {!isAdmin && (
                         <Link 
                           to="/profile"
                           onClick={() => setShowUserDropdown(false)}
                           className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-xl transition-all duration-200"
                         >
                           <FiUser className="text-lg" />
                           <span>My Profile</span>
                         </Link>
                       )}
                         <Button 
                           variant="ghost"
                           onClick={() => { logout(); setShowUserDropdown(false); }} 
                           className="w-full mt-1 !justify-start gap-3 !px-3 !py-2.5 text-red-500 border-t border-surface-100 dark:border-surface-800 !rounded-xl"
                           leftIcon={<FiLogOut className="text-lg" />}
                         >
                           <span className="text-sm font-semibold">Log Out</span>
                         </Button>
                      </div>
                    </>
                  )}
                </div>
              )
            )}
          </div>


          {/* Mobile hamburger */}
          <Button
            variant="secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 !p-0"
            id="mobile-menu-toggle"
            leftIcon={mobileOpen ? <HiOutlineX className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
          />
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 animate-slide-down">
            <div className="flex flex-col gap-2 pt-2">
               {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                          : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'
                      }`
                    }
                  >
                    {link.icon && <link.icon className="text-xl" />}
                    <span>{link.label}</span>
                  </NavLink>
                ))}

              <div className="border-t border-surface-100 dark:border-surface-800 my-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={toggleTheme}
                  className="w-full !justify-start gap-3 !px-4 !py-3"
                  leftIcon={isDark ? <FiSun /> : <FiMoon />}
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </Button>
                {isAuthenticated ? (
                  <Button 
                    variant="secondary"
                    onClick={() => { logout(); setMobileOpen(false); }} 
                    className="w-full mt-2 gap-2 text-red-500 !justify-center"
                    leftIcon={<FiLogOut />}
                  >
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <Link to="/login" className="btn-secondary text-sm text-center" onClick={() => setMobileOpen(false)}>Log In</Link>
                    <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
