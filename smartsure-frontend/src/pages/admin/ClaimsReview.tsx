import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminService } from '../../api/adminService'
import { authService } from '../../api/authService'
import { useDebounce } from '../../hooks/useDebounce'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Modal } from '../../components/common/Modal'
import { toast } from 'react-toastify'
import {
  reviewSchema,
  ReviewInput,
  claimEditSchema,
  ClaimEditInput,
} from '../../schemas/reviewSchema'
import { FormInput } from '../../components/common/FormInput'
import { FormTextarea } from '../../components/common/FormTextarea'
import { FormSelect } from '../../components/common/FormSelect'
import { Button } from '../../components/common/Button'
import {
  HiOutlineDownload,
  HiSearch,
  HiOutlineCheckCircle,
  HiOutlinePencilAlt,
  HiOutlineXCircle,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineBan,
  HiSortAscending,
  HiSortDescending,
  HiOutlineSwitchVertical,
} from 'react-icons/hi'
import { Pagination } from '../../components/common/Pagination'
import { Claim } from '../../types'

// Generates a consistent pastel color from a userId
const getAvatarColor = (userId: number | string) => {
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
  const id = typeof userId === 'number' ? userId : parseInt(userId.toString()) || 0
  return colors[id % colors.length]
}

export default function ClaimsReview() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([])

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 400)
  const [statusTab, setStatusTab] = useState('ALL')
  const [userNames, setUserNames] = useState<Record<string | number, string>>({}) // cache: { userId: name }
  const [sortBy, setSortBy] = useState<{ field: 'id' | 'name' | 'amount'; dir: 'asc' | 'desc' }>({
    field: 'id',
    dir: 'desc',
  })

  // Review Form
  const {
    register: registerReview,
    handleSubmit: handleSubmitReview,
    reset: resetReview,
    formState: { errors: reviewErrors, isSubmitting: isReviewing },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
  })

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isEditing },
  } = useForm<ClaimEditInput>({
    resolver: zodResolver(claimEditSchema),
  })

  useEffect(() => {
    if (debouncedSearchTerm === '') {
      fetchAllClaims(page)
    }
  }, [page, debouncedSearchTerm, pageSize])

  const fetchAllClaims = async (pageNum: number) => {
    setLoading(true)
    const response = await adminService.getAllClaims(pageNum, pageSize)
    if (response.success) {
      const data = response.data as any
      const claimsList = data?.content || []
      setClaims(claimsList)
      setFilteredClaims(claimsList)
      setTotalElements(data?.totalElements || 0)

      // Fetch user names for unique userIds
      const uniqueUserIds = [
        ...new Set(claimsList.map((c: Claim) => c.userId).filter(Boolean)),
      ] as (string | number)[]
      const namesToFetch = uniqueUserIds.filter((uid) => !userNames[uid])
      if (namesToFetch.length > 0) {
        const results = await Promise.allSettled(
          namesToFetch.map((uid) => authService.getUserById(uid))
        )
        const newNames = { ...userNames }
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value?.success) {
            const uData = result.value.data
            newNames[namesToFetch[idx]] = uData.name || uData.email || `User ${namesToFetch[idx]}`
          }
        })
        setUserNames(newNames)
      }
    } else {
      toast.error('Failed to load system claims.')
      setClaims([])
    }
    setLoading(false)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchTerm) {
      setPage(0)
      fetchAllClaims(0)
      return
    }
    setLoading(true)
    const numericTerm = searchTerm.replace(/\D/g, '')
    if (numericTerm) {
      const response = await adminService.getClaimsByUser(numericTerm)
      if (response.success) {
        const data = (response.data as any) || []
        setClaims(data)
        setFilteredClaims(data)
        setTotalElements(data.length)
      } else {
        toast.error('No claims found.')
        setClaims([])
      }
    } else {
      setPage(0)
      fetchAllClaims(0)
    }
    setLoading(false)
  }

  // Stats
  const stats = useMemo(() => {
    const all = claims
    return {
      total: totalElements,
      approved: all.filter((c) => c.status === 'APPROVED').length,
      review: all.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'SUBMITTED').length,
      rejected: all.filter((c) => c.status === 'REJECTED').length,
    }
  }, [claims, totalElements])

  // Toggle sort
  const toggleSort = (field: 'id' | 'name' | 'amount') => {
    setSortBy((prev) => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const SortBtn = ({ field }: { field: 'id' | 'name' | 'amount' }) => {
    const isActive = sortBy.field === field
    const Icon = isActive
      ? sortBy.dir === 'asc'
        ? HiSortAscending
        : HiSortDescending
      : HiOutlineSwitchVertical
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 ${
          isActive
            ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
            : 'bg-surface-200 dark:bg-surface-700 text-surface-500 hover:bg-surface-300 dark:hover:bg-surface-600'
        }`}
      >
        <Icon className="text-sm" />
      </span>
    )
  }

  // Local filtering + sorting
  useEffect(() => {
    let result = [...claims]
    if (statusTab !== 'ALL') {
      if (statusTab === 'PENDING') {
        result = result.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'SUBMITTED')
      } else {
        result = result.filter((c) => c.status === statusTab)
      }
    }
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      result = result.filter((c) => {
        const uid = (c.userId || '').toString()
        const cid = (c.id || c.claimId || '').toString()
        const name = (userNames[c.userId || ''] || '').toLowerCase()
        const desc = (c.description || '').toLowerCase()
        return uid.includes(term) || cid.includes(term) || name.includes(term) || desc.includes(term)
      })
    }
    // Sort
    const dir = sortBy.dir === 'asc' ? 1 : -1
    result.sort((a, b) => {
      if (sortBy.field === 'name') {
        const nameA = (userNames[a.userId || ''] || '').toLowerCase()
        const nameB = (userNames[b.userId || ''] || '').toLowerCase()
        return nameA.localeCompare(nameB) * dir
      }
      if (sortBy.field === 'amount') {
        const amtA = a.amount || a.claimAmount || 0
        const amtB = b.amount || b.claimAmount || 0
        return (amtA - amtB) * dir
      }
      // default: sort by id
      const idA = Number(a.claimId || a.id || 0)
      const idB = Number(b.claimId || b.id || 0)
      return (idA - idB) * dir
    })
    setFilteredClaims(result)
  }, [debouncedSearchTerm, claims, statusTab, userNames, sortBy])

  const handleOpenReview = (claim: Claim) => {
    setSelectedClaim(claim)
    
    // Map initial unreviewed states to UNDER_REVIEW so the dropdown isn't blank
    const validStatuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED']
    const defaultStatus = validStatuses.includes(claim.status || '') 
      ? claim.status 
      : 'UNDER_REVIEW'

    resetReview({
      remarks: '',
      status: defaultStatus as any,
    })
    setIsReviewModalOpen(true)
  }

  const handleOpenEdit = (claim: Claim) => {
    setSelectedClaim(claim)
    resetEdit({
      amount: String(claim.amount || claim.claimAmount || ''),
      description: claim.description || '',
    })
    setIsEditModalOpen(true)
  }

  const submitReview = async (data: ReviewInput) => {
    if (!selectedClaim) return
    const claimId = selectedClaim.claimId || selectedClaim.id
    const response = await adminService.reviewClaim(claimId, {
      status: data.status,
      remarks: data.remarks,
    })
    if (response.success) {
      toast.success(`Claim status updated to ${data.status.replace('_', ' ')}`)
      setIsReviewModalOpen(false)
      refreshList()
    } else {
      toast.error(response.message || 'Action failed. Check state transitions.')
    }
  }

  const submitEdit = async (data: ClaimEditInput) => {
    if (!selectedClaim) return
    const response = await adminService.updateClaim(selectedClaim.claimId || selectedClaim.id, {
      amount: Number(data.amount),
      description: data.description,
    })
    if (response.success) {
      toast.success('Claim details updated!')
      setIsEditModalOpen(false)
      refreshList()
    } else {
      toast.error(response.message || 'Failed to update claim details.')
    }
  }

  const refreshList = () => {
    if (searchTerm) {
      handleSearch()
    } else {
      fetchAllClaims(page)
    }
  }

  const handleDownload = async (claimId: string | number) => {
    if (!claimId) return
    const res = await adminService.downloadClaimDocument(claimId)
    if (res.success) {
      const contentType = (res as any).headers?.['content-type'] || 'application/octet-stream'
      const extension = contentType?.includes('image') ? 'jpg' : 'pdf'
      const url = window.URL.createObjectURL(new Blob([res.data], { type: contentType }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `claim_${claimId}_document.${extension}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Document download started')
    } else {
      toast.error('Document could not be retrieved.')
    }
  }

  const tabs = [
    { key: 'ALL', label: 'All Claims', count: stats.total, icon: null },
    { key: 'APPROVED', label: 'Approved', count: stats.approved, icon: HiOutlineShieldCheck },
    { key: 'PENDING', label: 'Pending', count: stats.review, icon: HiOutlineClock },
    { key: 'REJECTED', label: 'Rejected', count: stats.rejected, icon: HiOutlineBan },
  ]

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-primary-600 to-violet-600 p-8 md:p-10 shadow-2xl shadow-primary-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Claims Console
            </h1>
            <p className="text-indigo-100 mt-2 font-medium text-sm md:text-base">
              Review, audit, and process policyholder claims across all products.
            </p>
          </div>

          {/* KPI Counters */}
          <div className="flex gap-6 md:gap-10">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Approved', value: stats.approved, color: 'text-emerald-300' },
              { label: 'Pending', value: stats.review, color: 'text-amber-300' },
              { label: 'Rejected', value: stats.rejected, color: 'text-red-300' },
            ].map((kpi) => (
              <div key={kpi.label} className="text-center">
                <div className={`text-2xl md:text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200/80 mt-1">
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar: Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800/60 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200
                ${
                  statusTab === tab.key
                    ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
            >
              {tab.icon && <tab.icon className="text-sm" />}
              {tab.label}
              <span
                className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  statusTab === tab.key
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

          <FormInput
            type="text"
            placeholder="Search name, ID, or description..."
            leftIcon={<HiSearch />}
            containerClassName="w-full md:w-80"
            className="!rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {/* Claims Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="card overflow-hidden border-0 shadow-xl shadow-surface-900/5 dark:shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th
                      onClick={() => toggleSort('name')}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400 cursor-pointer select-none hover:text-primary-500 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        Filed By <SortBtn field="name" />
                      </span>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400 hidden lg:table-cell">
                      Description
                    </th>
                    <th
                      onClick={() => toggleSort('amount')}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400 cursor-pointer select-none hover:text-primary-500 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        Amount <SortBtn field="amount" />
                      </span>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-surface-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <HiOutlineExclamationCircle className="mx-auto text-4xl text-surface-300 dark:text-surface-600 mb-3" />
                        <p className="text-surface-500 font-medium">No claims match your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim, idx) => {
                      const id = claim.claimId || claim.id
                      const userId = claim.userId || ''
                      const name = userNames[userId] || `User ${userId}`
                      const initials = name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                      return (
                        <tr
                          key={id}
                          className={`group transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/30 ${
                            idx !== filteredClaims.length - 1
                              ? 'border-b border-surface-100 dark:border-surface-800/50'
                              : ''
                          }`}
                        >
                          {/* Claimant - Name + User ID */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                                  userId
                                )} flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0`}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-surface-900 dark:text-white truncate max-w-[160px]">
                                  {name}
                                </div>
                                <div className="text-[11px] text-surface-400 font-mono mt-0.5">
                                  ID {userId}
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Description */}
                          <td className="px-6 py-5 hidden lg:table-cell">
                            <p
                              className="text-sm text-surface-500 dark:text-surface-400 truncate max-w-[280px] leading-relaxed"
                              title={claim.description}
                            >
                              {claim.description || '—'}
                            </p>
                          </td>
                          {/* Amount */}
                          <td className="px-6 py-5">
                            <span className="text-base font-black text-surface-900 dark:text-white tabular-nums">
                              ₹{(claim.amount || claim.claimAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-6 py-5">
                            <StatusBadge status={claim.status} />
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenReview(claim)}
                                className="!p-2 text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                title="Review & Decide"
                                leftIcon={<HiOutlineCheckCircle className="text-[18px]" />}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(claim)}
                                className="!p-2 text-surface-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                title="Edit Details"
                                leftIcon={<HiOutlinePencilAlt className="text-[18px]" />}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  const idToDelete = claim.claimId || claim.id
                                  if (window.confirm('Permanently delete this claim?')) {
                                    const res = await adminService.deleteClaim(idToDelete)
                                    if (res.success) {
                                      toast.success('Claim deleted')
                                      refreshList()
                                    } else {
                                      toast.error('Failed to delete')
                                    }
                                  }
                                }}
                                className="!p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                title="Delete"
                                leftIcon={<HiOutlineXCircle className="text-[18px]" />}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={page + 1}
            totalItems={totalElements}
            itemsPerPage={pageSize}
            onPageChange={(p: number) => setPage(p - 1)}
            onItemsPerPageChange={(size: number) => {
              setPageSize(size)
              setPage(0)
            }}
          />
        </>
      )}

      {/* Review Modal */}
      {selectedClaim && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Case #${selectedClaim.claimId || selectedClaim.id}`}
        >
          <form onSubmit={handleSubmitReview(submitReview)} className="space-y-6">
            <div className="bg-surface-50 dark:bg-surface-800/50 p-5 rounded-xl space-y-3 border border-surface-200 dark:border-surface-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-surface-500">Claimant</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(
                      selectedClaim.userId || ''
                    )} flex items-center justify-center text-white text-[8px] font-black`}
                  >
                    {(userNames[selectedClaim.userId || ''] || 'U').charAt(0)}
                  </div>
                  <span className="text-sm font-bold">
                    {userNames[selectedClaim.userId || ''] || `User ${selectedClaim.userId}`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-surface-500">Current Status</span>
                <StatusBadge status={selectedClaim.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-surface-500">Requested Amount</span>
                <span className="font-bold text-lg">
                  ₹{(selectedClaim.amount || selectedClaim.claimAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="pt-2">
                <span className="text-sm font-semibold text-surface-500 block mb-1.5">
                  Description
                </span>
                <p className="text-sm text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-900 p-3 rounded-lg border border-surface-200 dark:border-surface-800 leading-relaxed">
                  {selectedClaim.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => handleDownload(selectedClaim.claimId || selectedClaim.id)}
              fullWidth
              size="lg"
              className="text-primary-600 dark:text-primary-400"
              leftIcon={<HiOutlineDownload className="text-lg" />}
            >
              Download Attached Document
            </Button>

            <div className="border-t border-surface-200 dark:border-surface-800 pt-6">
              <FormTextarea
                label="Internal Remarks"
                placeholder="Enter process notes or final decision comments..."
                rows={3}
                error={reviewErrors.remarks?.message}
                {...registerReview('remarks')}
              />

              <div className="mt-6 flex flex-col md:flex-row gap-6">
                <FormSelect
                  label="Set New Status"
                  containerClassName="flex-1"
                  error={reviewErrors.status?.message}
                  options={[
                    { value: 'UNDER_REVIEW', label: 'UNDER REVIEW' },
                    { value: 'APPROVED', label: 'APPROVED' },
                    { value: 'REJECTED', label: 'REJECTED' },
                    { value: 'CLOSED', label: 'CLOSED' },
                  ]}
                  {...registerReview('status')}
                />
                <Button
                  type="submit"
                  isLoading={isReviewing}
                  size="lg"
                  className="min-w-[160px] self-end md:mb-[2px]"
                >
                  Update Status
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {selectedClaim && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Case #${selectedClaim.claimId || selectedClaim.id}`}
        >
          <form onSubmit={handleSubmitEdit(submitEdit)} className="space-y-6">
            <p className="text-sm text-surface-500">
              Correct the amount or description for this security audit.
            </p>

            <div className="space-y-6">
              <FormInput
                type="number"
                label="Adjusted Amount (₹)"
                error={editErrors.amount?.message}
                {...registerEdit('amount')}
              />

              <FormTextarea
                label="Updated Description"
                rows={4}
                error={editErrors.description?.message}
                {...registerEdit('description')}
              />
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
                size="lg"
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-[2]"
                size="lg"
                isLoading={isEditing}
              >
                Update Details
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
