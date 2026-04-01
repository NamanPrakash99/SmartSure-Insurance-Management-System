import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HiOutlineViewGrid,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlinePlusCircle,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineCollection,
  HiOutlinePresentationChartBar
} from 'react-icons/hi'

export default function Sidebar() {
  const { isAdmin } = useAuth()

  const customerLinks = [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { to: '/policies', icon: HiOutlineShieldCheck, label: 'Browse Policies' },
    { to: '/my-policies', icon: HiOutlineCollection, label: 'My Policies' },
    { to: '/file-claim', icon: HiOutlinePlusCircle, label: 'File a Claim' },
    { to: '/my-claims', icon: HiOutlineClipboardList, label: 'My Claims' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', icon: HiOutlineChartBar, label: 'Dashboard' },
    { to: '/admin/policies', icon: HiOutlineCog, label: 'Manage Policies' },
    { to: '/admin/claims', icon: HiOutlineDocumentText, label: 'Review Claims' },
    { to: '/admin/user-policies', icon: HiOutlineShieldCheck, label: 'User Policies' },
    { to: '/admin/reports', icon: HiOutlinePresentationChartBar, label: 'Reports' },
  ]

  const links = isAdmin ? adminLinks : customerLinks

  return (
    <div className="hidden lg:block bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-14">
          <nav className="flex items-center gap-2 h-full py-1.5 overflow-x-auto no-scrollbar">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard' || link.to === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800'
                  }`
                }
              >
                <link.icon className="text-xl group-hover:scale-110 transition-transform" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
