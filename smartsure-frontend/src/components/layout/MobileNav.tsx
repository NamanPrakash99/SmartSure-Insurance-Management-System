import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HiOutlineViewGrid,
  HiOutlineShieldCheck,
  HiOutlineCollection,
  HiOutlinePlusCircle,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineDocumentText,
} from 'react-icons/hi'

export default function MobileNav() {
  const { isAdmin } = useAuth()

  const customerLinks = [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Home' },
    { to: '/policies', icon: HiOutlineShieldCheck, label: 'Policies' },
    { to: '/my-policies', icon: HiOutlineCollection, label: 'My Plans' },
    { to: '/file-claim', icon: HiOutlinePlusCircle, label: 'Claim' },
    { to: '/my-claims', icon: HiOutlineClipboardList, label: 'Claims' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', icon: HiOutlineChartBar, label: 'Home' },
    { to: '/admin/policies', icon: HiOutlineCog, label: 'Policies' },
    { to: '/admin/claims', icon: HiOutlineDocumentText, label: 'Claims' },
    { to: '/admin/user-policies', icon: HiOutlineShieldCheck, label: 'Users' },
  ]


  const links = isAdmin ? adminLinks : customerLinks

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard' || link.to === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-500 dark:text-surface-500'
              }`
            }
          >
            <link.icon className="text-xl" />
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
