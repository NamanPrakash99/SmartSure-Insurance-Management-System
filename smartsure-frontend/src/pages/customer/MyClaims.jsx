import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { claimService } from '../../api/claimService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { HiOutlineDownload, HiOutlineDocumentText } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function MyClaims() {
  const { user } = useAuth()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClaims()
  }, [user.id])

  const fetchClaims = async () => {
    try {
      const { data } = await claimService.getClaimsByUser(user.id)
      setClaims(data)
    } catch (error) {
      console.error("Failed to load claims", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (claimId) => {
    try {
      const response = await claimService.downloadDocument(claimId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `claim_document_${claimId}.pdf`) 
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Document download started')
    } catch (err) {
      console.error('Failed to download document:', err)
      toast.error('Could not download document. It may not have been uploaded.')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="section-title">My Claims</h1>
          <p className="text-surface-500 mt-1 text-sm">Track the status of your submitted claims.</p>
        </div>
        <Link to="/file-claim" className="btn-primary flex-shrink-0 text-sm inline-flex items-center gap-2">
          <HiOutlineDocumentText className="text-lg" />
          File New Claim
        </Link>
      </div>

      <div className="card overflow-hidden">
        {claims.length === 0 ? (
          <EmptyState 
            icon={HiOutlineDocumentText}
            title="No claims filed yet"
            description="If you need to make a claim on one of your policies, you can file one now."
            actionLabel="File a Claim"
            actionTo="/file-claim"
          />
        ) : (
          <div className="grid grid-cols-1 divide-y divide-surface-100 dark:divide-surface-800/60">
             {claims.map(claim => (
                <div key={claim.claimId} className="p-5 sm:p-6 hover:bg-surface-50 dark:hover:bg-surface-800/20 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-base text-surface-900 dark:text-white">Claim #{claim.claimId}</h3>
                        <StatusBadge status={claim.status} />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-surface-500">
                         <p><span className="font-semibold text-surface-700 dark:text-surface-300">Policy:</span> #{claim.policyId}</p>
                         <p><span className="font-semibold text-surface-700 dark:text-surface-300">Amount:</span> ₹{(claim.claimAmount||0).toLocaleString()}</p>
                      </div>

                      <div className="mt-3 bg-surface-50 dark:bg-surface-900/60 p-3.5 rounded-xl text-sm text-surface-600 dark:text-surface-300 leading-relaxed border border-surface-200/80 dark:border-surface-700/50">
                        {claim.description || claim.message}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 md:mt-0 shrink-0">
                      <button 
                        onClick={() => handleDownload(claim.claimId)}
                        title="Download Document"
                        className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
                      >
                         <HiOutlineDownload className="text-lg"/> <span>Document</span>
                      </button>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  )
}
