import { useState, useEffect } from 'react'
import { adminService } from '../../api/adminService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Modal } from '../../components/common/Modal'
import { toast } from 'react-toastify'
import { 
  HiOutlineDownload, 
  HiChevronLeft, 
  HiChevronRight, 
  HiSearch,
  HiOutlineCheckCircle,
  HiOutlinePencilAlt
} from 'react-icons/hi'

export default function ClaimsReview() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  
  const [reviewRemark, setReviewRemark] = useState('')
  const [targetStatus, setTargetStatus] = useState('')
  const [editingClaim, setEditingClaim] = useState({ claimAmount: 0, description: '' })
  const [searchUserId, setSearchUserId] = useState('')

  useEffect(() => {
    if (searchUserId === '') {
      fetchAllClaims(page)
    }
  }, [page, searchUserId, pageSize])

  const fetchAllClaims = async (pageNum) => {
    setLoading(true)
    try {
      const { data } = await adminService.getAllClaims(pageNum, pageSize)
      setClaims(data?.content || [])
      setTotalPages(data?.totalPages || 0)
      setTotalElements(data?.totalElements || 0)
    } catch (error) {
      console.error('Fetch all claims failed:', error)
      if (error.response) {
        console.error('Error Status:', error.response.status)
        console.error('Error Data:', error.response.data)
      }
      toast.error('Failed to load system claims.')
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!searchUserId) {
      setPage(0)
      fetchAllClaims(0)
      return
    }
    setLoading(true)
    try {
      const { data } = await adminService.getClaimsByUser(searchUserId)
      setClaims(data || [])
      setTotalPages(1)
      setTotalElements(data?.length || 0)
    } catch (error) {
      toast.error('No claims found for this user.')
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReview = (claim) => {
    setSelectedClaim(claim)
    setReviewRemark('')
    setTargetStatus(claim.status)
    setIsReviewModalOpen(true)
  }

  const handleOpenEdit = (claim) => {
    setSelectedClaim(claim)
    setEditingClaim({
      claimAmount: claim.claimAmount,
      description: claim.description
    })
    setIsEditModalOpen(true)
  }

  const submitReview = async (newStatus) => {
    try {
      const claimId = selectedClaim.claimId || selectedClaim.id
      await adminService.reviewClaim(claimId, {
        status: newStatus,
        remark: reviewRemark
      })
      toast.success(`Claim status updated to ${newStatus}`)
      setIsReviewModalOpen(false)
      refreshList()
    } catch (error) {
      toast.error('Action failed. Check if claim state allows this transition.')
    }
  }


  const submitEdit = async () => {
    try {
      await adminService.updateClaim(selectedClaim.claimId, editingClaim)
      toast.success('Claim details updated!')
      setIsEditModalOpen(false)
      refreshList()
    } catch (error) {
      toast.error('Failed to update claim details.')
    }
  }

  const refreshList = () => {
    if (searchUserId) {
      handleSearch()
    } else {
      fetchAllClaims(page)
    }
  }

  const handleDownload = async (claimId) => {
    try {
      if (!claimId) throw new Error("Missing Claim ID")
      
      const res = await adminService.downloadClaimDocument(claimId)
      
      // Determine file type from header if possible, or fallback to pdf
      const contentType = res.headers['content-type']
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
    } catch (err) {
      console.error("Download Error:", err)
      toast.error('The requested document could not be retrieved. It may not have been uploaded yet.')
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Review Claims</h1>
          <p className="text-surface-500 mt-1">
             Manage and audit insurance claims across the system.
          </p>
        </div>

        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="relative group">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search User ID..." 
              className="input-field pl-10 pr-20 !py-2.5 w-64" 
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

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-800">
                  <th className="table-header">Claim ID</th>
                  <th className="table-header">User ID</th>
                  <th className="table-header hidden sm:table-cell">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-surface-500">No claims found.</td>
                  </tr>
                ) : claims.map((claim) => {
                  const id = claim.claimId || claim.id
                  return (
                    <tr key={id} className="hover:bg-surface-50 dark:hover:bg-surface-800/20 transition-colors">
                      <td className="p-4 font-mono font-medium">{id}</td>
                      <td className="p-4 text-sm font-semibold text-surface-600 dark:text-surface-400">ID: {claim.userId || 'N/A'}</td>
                      <td className="p-4 font-semibold text-surface-900 dark:text-white hidden sm:table-cell">₹{(claim.claimAmount||0).toLocaleString()}</td>
                      <td className="p-4"><StatusBadge status={claim.status} /></td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenReview(claim)}
                            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Review Decision"
                          >
                            <HiOutlineCheckCircle className="text-xl" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(claim)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit Details"
                          >
                            <HiOutlinePencilAlt className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Finalized Pagination Toolbar */}
          <div className="p-4 border-t border-surface-100 dark:border-surface-700/50 flex flex-row items-center justify-between">
             {/* LEFT: Previous */}
             <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl transition-all disabled:opacity-30 enabled:hover:bg-surface-100 dark:enabled:hover:bg-surface-800 border border-surface-200 dark:border-surface-700"
             >
                Previous
             </button>

             {/* CENTER: Current Page Indicator */}
             <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest hidden sm:inline">Page</span>
                <span className="bg-primary-500/10 text-primary-500 px-3 py-1 rounded-lg text-xs font-black ring-1 ring-primary-500/20">
                   {page + 1} <span className="text-surface-400 dark:text-surface-600 font-medium px-1">of</span> {totalPages || 1}
                </span>
             </div>

             {/* RIGHT: Next & Page Size */}
             <div className="flex items-center gap-4">
                <button 
                  disabled={page >= totalPages - 1 || totalPages === 0}
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl transition-all disabled:opacity-30 enabled:hover:bg-surface-100 dark:enabled:hover:bg-surface-800 border border-surface-200 dark:border-surface-700"
                >
                   Next
                </button>
                
                {!searchUserId && (
                  <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-surface-100 dark:border-surface-700/50">
                     <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Show:</p>
                     <select 
                       value={pageSize}
                       onChange={(e) => {
                          setPageSize(Number(e.target.value))
                          setPage(0)
                       }}
                       className="bg-surface-50 dark:bg-surface-800 border-none text-[10px] font-black rounded-lg px-2.5 py-1.5 outline-none ring-1 ring-surface-200 dark:ring-surface-700 cursor-pointer hover:ring-primary-500/50 transition-all font-sans"
                     >
                        {[10, 50, 100].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                     </select>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedClaim && (
        <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Review Claim ${selectedClaim.claimId}`}>
          <div className="space-y-6">
             <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl space-y-2 border border-surface-200 dark:border-surface-700">
                <div className="flex justify-between">
                   <span className="text-sm font-semibold text-surface-500">Claimant</span>
                   <span className="text-sm font-bold">User: {selectedClaim.userId}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-sm font-semibold text-surface-500">Current Status</span>
                   <StatusBadge status={selectedClaim.status} />
                </div>
                <div className="flex justify-between">
                   <span className="text-sm font-semibold text-surface-500">Requested Amount</span>
                   <span className="font-bold">₹{(selectedClaim.claimAmount||0).toLocaleString()}</span>
                </div>
                <div className="pt-2">
                   <span className="text-sm font-semibold text-surface-500 block mb-1">Description</span>
                   <p className="text-sm text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-900 p-3 rounded-lg border border-surface-200 dark:border-surface-800">{selectedClaim.description || 'No description provided.'}</p>
                </div>
             </div>

             <button 
                type="button" 
                onClick={() => handleDownload(selectedClaim.claimId || selectedClaim.id)}
                className="w-full btn-secondary py-3 flex items-center justify-center gap-2 border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10"
              >
                <HiOutlineDownload className="text-lg" /> Download Attached Document
             </button>

             <div className="border-t border-surface-200 dark:border-surface-800 pt-6">
                <div className="mb-4">
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-2">Internal Remarks *</label>
                  <textarea 
                    required
                    placeholder="Enter process notes or final decision comments..."
                    className="input-field h-24 resize-none"
                    value={reviewRemark}
                    onChange={e => setReviewRemark(e.target.value)}
                  />
                </div>

                <div>
                   <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-2">Set New Status</label>
                   <div className="flex gap-3">
                      <select 
                        className="input-field flex-1"
                        value={targetStatus}
                        onChange={(e) => setTargetStatus(e.target.value)}
                      >
                         <option value="UNDER_REVIEW">UNDER REVIEW</option>
                         <option value="APPROVED">APPROVED</option>
                         <option value="REJECTED">REJECTED</option>
                         <option value="CLOSED">CLOSED</option>

                      </select>
                      <button 
                        onClick={() => submitReview(targetStatus)} 
                        className="btn-primary py-3 px-8 shadow-lg shadow-primary-500/20"
                      >
                        Update Status
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {selectedClaim && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Claim ${selectedClaim.claimId}`}>
          <div className="space-y-6">
            <p className="text-sm text-surface-500">Correct the amount or description for this security audit.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Adjusted Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={editingClaim.claimAmount}
                  onChange={(e) => setEditingClaim({...editingClaim, claimAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Updated Description</label>
                <textarea 
                  rows="4"
                  className="input-field resize-none"
                  value={editingClaim.description}
                  onChange={(e) => setEditingClaim({...editingClaim, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 btn-secondary py-3"
              >
                Cancel
              </button>
              <button 
                onClick={submitEdit}
                className="flex-[2] btn-primary py-3"
              >
                Update Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
