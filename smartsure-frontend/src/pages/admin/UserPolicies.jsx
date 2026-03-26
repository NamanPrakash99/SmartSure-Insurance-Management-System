import { useState, useEffect, useMemo } from 'react'
import { adminService } from '../../api/adminService'
import { authService } from '../../api/authService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { toast } from 'react-toastify'
import {
  HiSearch,
  HiOutlineShieldCheck,
  HiOutlineBan,
  HiOutlineExclamationCircle,
  HiSortAscending,
  HiSortDescending,
  HiOutlineSwitchVertical
} from 'react-icons/hi'
import { Pagination } from '../../components/common/Pagination'

const getAvatarColor = (userId) => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-sky-500 to-blue-600',
    'from-teal-500 to-emerald-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-blue-600',
    'from-cyan-500 to-teal-600',
    'from-fuchsia-500 to-pink-600',
  ]
  return colors[(userId || 0) % colors.length]
}

export default function UserPolicies() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [userNames, setUserNames] = useState({})
  const [sortBy, setSortBy] = useState({ field: 'id', dir: 'desc' })

  useEffect(() => {
    if (!searchTerm) {
      fetchAllUserPolicies()
    }
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm])

  const fetchAllUserPolicies = async () => {
    setLoading(true)
    try {
      const { data } = await adminService.getAllUserPolicies()
      setPolicies(data || [])

      // Fetch user names
      const uniqueUserIds = [...new Set((data || []).map(p => p.userId).filter(Boolean))]
      const namesToFetch = uniqueUserIds.filter(uid => !userNames[uid])
      if (namesToFetch.length > 0) {
        const results = await Promise.allSettled(
          namesToFetch.map(uid => authService.getUserById(uid))
        )
        const newNames = { ...userNames }
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value?.data) {
            newNames[namesToFetch[idx]] = result.value.data.name || result.value.data.email || `User ${namesToFetch[idx]}`
          }
        })
        setUserNames(newNames)
      }
    } catch (error) {
      toast.error('Failed to fetch system policies.')
      setPolicies([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this policy? This action is irreversible.')) return
    try {
      await adminService.cancelUserPolicy(id)
      toast.success('Policy cancelled successfully')
      fetchAllUserPolicies()
    } catch (error) {
      toast.error('Failed to cancel policy')
    }
  }

  // Stats
  const stats = useMemo(() => ({
    total: policies.length,
    active: policies.filter(p => p.status === 'ACTIVE').length,
    cancelled: policies.filter(p => p.status === 'CANCELLED').length,
  }), [policies])

  // Sort
  const toggleSort = (field) => {
    setSortBy(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc'
    }))
  }

  const SortBtn = ({ field }) => {
    const isActive = sortBy.field === field
    const Icon = isActive ? (sortBy.dir === 'asc' ? HiSortAscending : HiSortDescending) : HiOutlineSwitchVertical
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 ${
        isActive
          ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
          : 'bg-surface-200 dark:bg-surface-700 text-surface-500 hover:bg-surface-300 dark:hover:bg-surface-600'
      }`}>
        <Icon className="text-sm" />
      </span>
    )
  }

  // Filter + sort
  const processedPolicies = useMemo(() => {
    let result = [...policies]

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter)
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(p => {
        const uid = (p.userId || '').toString()
        const pid = (p.id || '').toString()
        const name = (userNames[p.userId] || '').toLowerCase()
        const product = (p.policyName || '').toLowerCase()
        return uid.includes(term) || pid.includes(term) || name.includes(term) || product.includes(term)
      })
    }

    // Sort
    const dir = sortBy.dir === 'asc' ? 1 : -1
    result.sort((a, b) => {
      if (sortBy.field === 'user') {
        const nameA = (userNames[a.userId] || '').toLowerCase()
        const nameB = (userNames[b.userId] || '').toLowerCase()
        return nameA.localeCompare(nameB) * dir
      }
      if (sortBy.field === 'product') {
        return (a.policyName || '').localeCompare(b.policyName || '') * dir
      }
      return ((a.id || 0) - (b.id || 0)) * dir
    })

    return result
  }, [policies, statusFilter, searchTerm, userNames, sortBy])

  // Pagination
  const totalItems = processedPolicies.length
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPolicies = processedPolicies.slice(startIndex, startIndex + pageSize)

  const tabs = [
    { key: 'ALL',       label: 'All Policies', count: stats.total,     icon: null },
    { key: 'ACTIVE',    label: 'Active',       count: stats.active,    icon: HiOutlineShieldCheck },
    { key: 'CANCELLED', label: 'Cancelled',    count: stats.cancelled, icon: HiOutlineBan },
  ]

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 md:p-10 shadow-2xl shadow-primary-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Policy Hub</h1>
            <p className="text-indigo-100 mt-2 font-medium text-sm md:text-base">
              Comprehensive overview of all customer insurance enrollments and historic records.
            </p>
          </div>

          {/* KPI Counters */}
          <div className="flex gap-6 md:gap-10">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Active', value: stats.active, color: 'text-emerald-300' },
              { label: 'Cancelled', value: stats.cancelled, color: 'text-red-300' },
            ].map(kpi => (
              <div key={kpi.label} className="text-center">
                <div className={`text-2xl md:text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200/80 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar: Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800/60 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200
                ${statusFilter === tab.key
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`
              }
            >
              {tab.icon && <tab.icon className="text-sm" />}
              {tab.label}
              <span className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${statusFilter === tab.key ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-surface-200 dark:bg-surface-700 text-surface-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative group flex-shrink-0">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search name, ID, or product..."
            className="input-field pl-10 !py-2.5 w-full md:w-80 !rounded-xl"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors text-xs font-bold">✕</button>
          )}
        </div>
      </div>

      {/* Policies Table */}
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden border-0 shadow-xl shadow-surface-900/5 dark:shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400">Purchase ID</th>
                    <th onClick={() => toggleSort('user')} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400 cursor-pointer select-none hover:text-primary-500 transition-colors">
                      <span className="flex items-center gap-2">Enrolled By <SortBtn field="user" /></span>
                    </th>
                    <th onClick={() => toggleSort('product')} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400 cursor-pointer select-none hover:text-primary-500 transition-colors hidden md:table-cell">
                      <span className="flex items-center gap-2">Product <SortBtn field="product" /></span>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400 hidden lg:table-cell">Expiry Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPolicies.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <HiOutlineExclamationCircle className="mx-auto text-4xl text-surface-300 dark:text-surface-600 mb-3" />
                        <p className="text-surface-500 font-medium">No policies match your filters.</p>
                      </td>
                    </tr>
                  ) : paginatedPolicies.map((p, idx) => {
                    const name = userNames[p.userId] || `User ${p.userId}`
                    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                    return (
                      <tr
                        key={p.id}
                        className={`group transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/30 ${idx !== paginatedPolicies.length - 1 ? 'border-b border-surface-100 dark:border-surface-800/50' : ''}`}
                      >
                        <td className="px-6 py-5">
                          <span className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400">
                            #{String(p.id).padStart(3, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(p.userId)} flex items-center justify-center text-white text-[10px] font-black shadow-md flex-shrink-0`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-surface-900 dark:text-white truncate max-w-[140px]">{name}</div>
                              <div className="text-[11px] text-surface-400 font-mono">ID {p.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{p.policyName || `Product ${p.policyProductId || p.policyId}`}</span>
                        </td>
                        <td className="px-6 py-5 hidden lg:table-cell">
                          <span className="text-sm text-surface-500">
                            {p.expiryDate || p.endDate ? new Date(p.expiryDate || p.endDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-5"><StatusBadge status={p.status} /></td>
                        <td className="px-6 py-5 text-right">
                          {p.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleCancel(p.id)}
                              className="opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-red-500/20"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        </>
      )}
    </div>
  )
}
