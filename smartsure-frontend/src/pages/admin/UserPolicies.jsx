import { useState, useEffect } from 'react'
import { adminService } from '../../api/adminService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { toast } from 'react-toastify'
import { HiSearch } from 'react-icons/hi'
import { Pagination } from '../../components/common/Pagination'

export default function UserPolicies() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchUserId, setSearchUserId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    if (!searchUserId) {
      fetchAllUserPolicies()
    }
  }, [searchUserId])

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchUserId])

  const filteredPolicies = policies.filter(p => {
    if (statusFilter === 'ALL') return true
    return p.status === statusFilter
  })

  // Pagination Logic
  const totalItems = filteredPolicies.length
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + pageSize)

  const fetchAllUserPolicies = async () => {
    setLoading(true)
    try {
      const { data } = await adminService.getAllUserPolicies()
      setPolicies(data || [])
    } catch (error) {
      toast.error('Failed to fetch system policies.')
      setPolicies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!searchUserId) {
      fetchAllUserPolicies()
      return
    }
    setLoading(true)
    try {
      const { data } = await adminService.getUserPolicies(searchUserId)
      setPolicies(data || [])
    } catch (error) {
      toast.error('No policies found for this user.')
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
      if (searchUserId) {
        handleSearch()
      } else {
        fetchAllUserPolicies()
      }
    } catch (error) {
      toast.error('Failed to cancel policy')
    }
  }

  return (
    <>
      <div className="space-y-10 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="section-title !text-4xl">User Policies</h1>
            <p className="text-surface-500 mt-2 font-medium">Comprehensive overview of all customer insurance enrollments and historic policy records.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Status Filter Chips */}
            <div className="flex items-center bg-surface-100 dark:bg-surface-800 p-1 rounded-xl border border-surface-200 dark:border-surface-700">
              {['ALL', 'ACTIVE', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                    statusFilter === status
                      ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-white shadow-sm'
                      : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text" 
                  placeholder="Search User ID..." 
                  className="input-field pr-20 !py-2.5 w-64" 
                  value={searchUserId}
                  onChange={e => setSearchUserId(e.target.value)}
                />
                <button type="submit" className="absolute right-1 top-1.5 bottom-1.5 px-3 bg-primary-500 text-white rounded-lg text-xs font-semibold hover:bg-primary-600 transition-colors">
                  Search
                </button>
              </form>
              {searchUserId && (
                <button onClick={() => setSearchUserId('')} className="btn-secondary !py-2.5 text-xs">Clear</button>
              )}
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className="card overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700/50">
                      <th className="table-header">Purchase ID</th>
                      <th className="table-header">User ID</th>
                      <th className="table-header">Product</th>
                      <th className="table-header">Expiry Date</th>
                      <th className="table-header">Status</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {paginatedPolicies.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-12 text-center text-surface-500">No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} policies found.</td>
                      </tr>
                    ) : (
                      paginatedPolicies.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/20 transition-colors">
                          <td className="p-4 font-mono font-medium">{p.id}</td>
                          <td className="p-4 text-sm font-semibold text-surface-600 dark:text-surface-400">User: {p.userId}</td>
                          <td className="p-4 text-sm font-semibold">{p.policyName || `Product ID: ${p.policyProductId || p.policyId}`}</td>
                          <td className="p-4 text-sm text-surface-600 dark:text-surface-400">
                            {p.expiryDate || p.endDate ? new Date(p.expiryDate || p.endDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4"><StatusBadge status={p.status} /></td>
                          <td className="p-4 text-right">
                            {p.status === 'ACTIVE' && (
                              <button 
                                onClick={() => handleCancel(p.id)} 
                                className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-red-500/20"
                              >
                                Cancel Policy
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
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
    </>
  )
}
