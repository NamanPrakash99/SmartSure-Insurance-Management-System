import React, { useState, useEffect, useMemo } from 'react'
import { adminService } from '../../api/adminService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { toast } from 'react-toastify'
import { useDebounce } from '../../hooks/useDebounce'
import {
  HiSearch,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineCurrencyRupee,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineChevronRight,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from 'react-icons/hi'
import { FormInput } from '../../components/common/FormInput'
import { Button } from '../../components/common/Button'
import { User, UserPolicy, Claim } from '../../types'

const getAvatarColor = (userId: string | number) => {
  const colors = [
    'from-violet-500 to-indigo-600',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ]
  const id = typeof userId === 'number' ? userId : parseInt(userId) || 0
  return colors[id % colors.length]
}

export default function UserPolicies() {
  const [customers, setCustomers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([])
  const [userClaims, setUserClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 400)
  const [totalActivePolicies, setTotalActivePolicies] = useState(0)

  useEffect(() => {
    fetchCustomers()
    fetchGlobalStats()
  }, [])

  const fetchGlobalStats = async () => {
    try {
      const response = await adminService.getAllUserPolicies()
      if (response.success) {
        const data = response.data || []
        const activeCount = data.filter(p => p.status === 'ACTIVE').length
        setTotalActivePolicies(activeCount)
      }
    } catch (error) {
      console.error('Failed to fetch global stats', error)
    }
  }

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await adminService.getCustomers()
      if (response.success) {
        const data = response.data || []
        setCustomers(data)
        if (data.length > 0) {
          handleUserClick(data[0])
        }
      }
    } catch (error) {
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = async (user: User) => {
    setSelectedUser(user)
    setDetailLoading(true)
    try {
      const [policiesRes, claimsRes] = await Promise.all([
        adminService.getUserPolicies(user.id),
        adminService.getClaimsByUser(user.id)
      ])
      if (policiesRes.success) setUserPolicies(policiesRes.data || [])
      if (claimsRes.success) setUserClaims(claimsRes.data || [])
    } catch (error) {
      toast.error('Failed to fetch user portfolio')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCancelPolicy = async (id: string | number) => {
    if (!window.confirm('Cancel this policy?')) return
    try {
      const response = await adminService.cancelUserPolicy(id)
      if (response.success) {
        toast.success('Policy cancelled')
        if (selectedUser) handleUserClick(selectedUser) 
      }
    } catch (error) {
      toast.error('Failed to cancel')
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  }, [customers, debouncedSearchTerm])

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* KPI Stats Top Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4 border-l-4 border-primary-500">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
            <HiOutlineUser className="text-2xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">{customers.length}</div>
            <div className="text-xs font-bold text-surface-400 uppercase tracking-widest">Total Customers</div>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <HiOutlineShieldCheck className="text-2xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">
              {totalActivePolicies} 
            </div>
            <div className="text-xs font-bold text-surface-400 uppercase tracking-widest">Active Policies</div>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4 border-l-4 border-amber-500">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <HiOutlineClock className="text-2xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-surface-900 dark:text-white">0</div>
            <div className="text-xs font-bold text-surface-400 uppercase tracking-widest">Pending Requests</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar: Customer List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-4">
            <FormInput
              type="text" 
              placeholder="Search by name or email..."
              leftIcon={<HiSearch />}
              className="!text-sm !py-2"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="card p-2 space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-black text-surface-400 uppercase tracking-widest">Customers</div>
            {filteredCustomers.map(customer => (
              <button
                key={customer.id}
                onClick={() => handleUserClick(customer)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  selectedUser?.id === customer.id 
                    ? 'bg-primary-50 dark:bg-primary-500/10 border border-primary-500/20 shadow-lg shadow-primary-500/5' 
                    : 'hover:bg-surface-50 dark:hover:bg-surface-800 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br ${getAvatarColor(customer.id)} flex items-center justify-center text-white text-xs font-black shadow-md shadow-black/5`}>
                  {customer.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left overflow-hidden">
                  <div className={`font-bold text-sm truncate ${selectedUser?.id === customer.id ? 'text-primary-600 dark:text-primary-400' : 'text-surface-900 dark:text-white'}`}>
                    {customer.name}
                  </div>
                  <div className="text-[10px] text-surface-400 font-medium truncate">{customer.email}</div>
                  <div className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded-md bg-surface-100 dark:bg-surface-700 text-[10px] font-bold text-surface-500">
                    ID {customer.id}
                  </div>
                </div>
                <HiOutlineChevronRight className={`ml-auto text-lg transition-transform ${selectedUser?.id === customer.id ? 'translate-x-1 text-primary-500' : 'text-surface-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: User Portfolio */}
        <div className="lg:col-span-8 space-y-6">
          {selectedUser ? (
            <>
              {/* Profile Header */}
              <div className="card p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${getAvatarColor(selectedUser.id)} flex items-center justify-center text-white text-3xl font-black shadow-2xl`}>
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h2 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">{selectedUser.name}</h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-surface-500">
                          <HiOutlineMail className="text-primary-500" /> {selectedUser.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-surface-500">
                          <HiOutlinePhone className="text-primary-500" /> {selectedUser.phone || 'No phone'}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-surface-500">
                          <HiOutlineLocationMarker className="text-primary-500" /> {selectedUser.address || 'No address'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                      <div className="bg-surface-50 dark:bg-surface-800/50 px-4 py-2 rounded-2xl">
                        <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Outstanding</div>
                        <div className="text-lg font-black text-surface-900 dark:text-white">₹0</div>
                      </div>
                      <div className="bg-surface-50 dark:bg-surface-800/50 px-4 py-2 rounded-2xl">
                        <div className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Pending Claims</div>
                        <div className="text-lg font-black text-surface-900 dark:text-white">
                          {userClaims.filter(c => c.status === 'PENDING').length}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleUserClick(selectedUser)}
                        className="ml-auto w-10 h-10 !p-0"
                        leftIcon={<HiOutlineRefresh />}
                        title="Refresh Portfolio"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Portfolio */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HiOutlineShieldCheck className="text-primary-500 text-xl" />
                    <span className="font-black text-sm uppercase tracking-wider text-surface-900 dark:text-white">Policy Portfolio</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-surface-100 dark:bg-surface-800 text-surface-500 rounded-md">
                    {userPolicies.length} Records
                  </span>
                </div>
                
                {detailLoading ? <div className="p-12"><LoadingSpinner /></div> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-50/50 dark:bg-surface-800/30">
                          <th className="px-6 py-3 text-[10px] font-black text-surface-400 uppercase tracking-widest">Policy</th>
                          <th className="px-6 py-3 text-[10px] font-black text-surface-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-3 text-[10px] font-black text-surface-400 uppercase tracking-widest">Next Billing</th>
                          <th className="px-6 py-3 text-[10px] font-black text-surface-400 uppercase tracking-widest">Premium</th>
                          <th className="px-6 py-3 text-[10px] font-black text-surface-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                        {userPolicies.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <HiOutlineExclamationCircle className="mx-auto text-3xl text-surface-300 dark:text-surface-600 mb-2" />
                              <p className="text-sm font-medium text-surface-400">No active policies found.</p>
                            </td>
                          </tr>
                        ) : userPolicies.map(p => (
                          <tr key={p.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm text-surface-900 dark:text-white">{p.policy?.name || 'Policy'}</div>
                              <div className="text-[10px] text-surface-400 font-mono">{p.id}</div>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                            <td className="px-6 py-4 text-sm font-medium text-surface-500">
                              {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm font-black text-surface-700 dark:text-surface-300">
                                <HiOutlineCurrencyRupee className="text-base text-primary-500" />
                                {p.premiumAmount || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {p.status === 'ACTIVE' && (
                                <Button 
                                  variant="ghost"
                                  onClick={() => handleCancelPolicy(p.id)}
                                  className="text-red-500 hover:text-red-400 !p-2"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Claims History */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HiOutlineDocumentText className="text-accent-500 text-xl" />
                    <span className="font-black text-sm uppercase tracking-wider text-surface-900 dark:text-white">Recent Claims</span>
                  </div>
                </div>
                {detailLoading ? null : (
                  <div className="p-6">
                    {userClaims.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-xs font-bold text-surface-400">No claim history available.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userClaims.slice(0, 4).map(claim => (
                          <div key={claim.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-100 dark:border-surface-700">
                            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 flex-shrink-0">
                              <HiOutlineClipboardList className="text-xl" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="font-bold text-sm truncate">{claim.description || 'Claim'}</div>
                              <div className="text-[10px] text-surface-500 flex items-center gap-2">
                                <span>₹{claim.amount || claim.claimAmount || 0}</span>
                                <span>•</span>
                                <span className="uppercase">{claim.status}</span>
                              </div>
                            </div>
                            <StatusBadge status={claim.status} />
                          </div>
                        ))}
                      </div>
                    )
                    }
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-300">
                <HiOutlineUser className="text-4xl" />
              </div>
              <div>
                <h3 className="font-black text-xl text-surface-900 dark:text-white">No Customer Selected</h3>
                <p className="text-surface-400 text-sm max-w-xs mx-auto mt-2 font-medium">Select a customer from the left sidebar to view their full insurance portfolio, claims history, and details.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
