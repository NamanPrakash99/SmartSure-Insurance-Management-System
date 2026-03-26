import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { claimService } from '../../api/claimService'
import { policyService } from '../../api/policyService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { HiOutlineDownload, HiOutlineDocumentText, HiOutlinePlus, HiOutlineArrowLeft, HiOutlineUpload, HiOutlineDocumentAdd, HiArrowRight, HiOutlineEye, HiOutlineX } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { Pagination } from '../../components/common/Pagination'

export default function MyClaims() {
  const { user } = useAuth()
  const location = useLocation()
  const defaultPolicyId = location.state?.policyId?.toString() || ''

  const [claims, setClaims] = useState([])
  const [policies, setPolicies] = useState([])
  const [allPolicies, setAllPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(!!defaultPolicyId)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(defaultPolicyId ? 2 : 1)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchData()
  }, [user.id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [claimsRes, policiesRes] = await Promise.all([
        claimService.getClaimsByUser(user.id),
        policyService.getUserPolicies(user.id)
      ])
      setClaims(claimsRes.data || [])
      setAllPolicies(policiesRes.data || [])
      setPolicies((policiesRes.data || []).filter(p => p.status === 'ACTIVE' || p.status === 'EXPIRED'))
    } catch (error) {
      console.error("Failed to load data", error)
      toast.error('Failed to load claims portal')
    } finally {
      setLoading(false)
    }
  }

  const paginatedClaims = useMemo(() => {
    return claims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [claims, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [showForm, itemsPerPage])

  // Form State
  const [policyId, setPolicyId] = useState(defaultPolicyId)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDownload = async (claimId) => {
    try {
      const res = await claimService.downloadDocument(claimId)
      
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
      toast.error('Could not download document. It may not have been uploaded.')
    }
  }

  const handleView = async (claimId) => {
    try {
      const res = await claimService.downloadDocument(claimId)
      const contentType = res.headers['content-type']
      
      const url = window.URL.createObjectURL(new Blob([res.data], { type: contentType }))
      window.open(url, '_blank')
      
      // Cleanup after a short delay to ensure it opens
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (err) {
      toast.error('Could not view document. It may not have been uploaded.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!policyId || !amount || !description) {
      toast.warning('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const claimData = { policyId: Number(policyId), userId: user.id, claimAmount: Number(amount), description }
      const initiateRes = await claimService.initiateClaim(claimData)
      const claimId = initiateRes.data.claimId

      if (file && claimId) {
        await claimService.uploadDocument(claimId, file)
      }

      toast.success('Claim submitted successfully')
      setShowForm(false)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setPolicyId('')
    setAmount('')
    setDescription('')
    setFile(null)
    setStep(1)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="section-title text-3xl sm:text-4xl mb-2">
            {showForm ? 'Initiate a Claim' : 'Claims Management'}
          </h1>
          <p className="text-surface-500 font-medium">
            {showForm 
              ? 'Provide details about your incident for rapid processing.' 
              : 'Monitor your submitted claims and settlement statuses.'}
          </p>
        </div>
        
        {!showForm ? (
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary flex-shrink-0 text-sm px-6 py-3 shadow-primary-500/20 flex items-center gap-2"
          >
            <HiOutlinePlus className="text-lg" />
            File New Claim
          </button>
        ) : (
          <button 
            onClick={() => { setShowForm(false); resetForm(); }}
            className="btn-secondary flex-shrink-0 text-sm px-6 py-3 flex items-center gap-2"
          >
            <HiOutlineArrowLeft className="text-lg" />
            Back to Claims History
          </button>
        )}
      </div>

      {showForm ? (
        <div className="max-w-3xl mx-auto space-y-8 mt-10">
          <div className="flex items-center justify-center max-w-md mx-auto mb-8 animate-fade-in">
            <div className="flex flex-col items-center">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${step >= 1 ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-surface-200 text-surface-400'}`}>1</div>
               <span className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${step >= 1 ? 'text-primary-600' : 'text-surface-400'}`}>Policy</span>
            </div>
            <div className={`flex-1 h-1 mx-4 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-800'}`} />
            <div className="flex flex-col items-center">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${step >= 2 ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-surface-200 dark:bg-surface-800 text-surface-400'}`}>2</div>
               <span className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${step >= 2 ? 'text-primary-600' : 'text-surface-400'}`}>Details</span>
            </div>
          </div>

          <div className="card-glass p-6 md:p-10 animate-slide-up">
            {step === 1 ? (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">Target Policy</label>
                  {policies.length === 0 ? (
                    <div className="p-8 text-center bg-surface-50 dark:bg-surface-900/40 rounded-2xl border border-dashed border-surface-200 dark:border-surface-700">
                      <p className="text-surface-500 text-sm mb-4">No active policies eligible for a claim.</p>
                      <a href="/policies" className="text-primary-600 font-bold hover:underline">Browse New Policies</a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {policies.map(p => (
                        <label key={p.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${policyId === p.id.toString() ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-1 ring-primary-500/50' : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                          <input 
                            type="radio" 
                            name="policyId" 
                            value={p.id} 
                            checked={policyId === p.id.toString()}
                            onChange={(e) => setPolicyId(e.target.value)}
                            className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-surface-300 dark:border-surface-600 dark:bg-surface-900" 
                          />
                          <div className="ml-4 flex-1">
                             <span className="block font-bold text-surface-900 dark:text-white">{p.policyName}</span>
                             <span className="block text-xs text-surface-500 font-mono mt-0.5">ID: {p.id} • Premium: ₹{p.premiumAmount}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                   onClick={() => setStep(2)}
                   disabled={!policyId}
                   className="w-full btn-primary py-4 mt-8 flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Continue to Incident Details
                   <HiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">Claim Request Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-surface-400">₹</span>
                      <input
                        type="number"
                        required
                        className="input-field !pl-10 text-lg font-bold"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">Incident Description</label>
                    <textarea
                      required
                      placeholder="Describe what happened..."
                      className="input-field h-40 resize-none leading-relaxed"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2 flex justify-between">
                      <span>Supporting Evidence</span>
                      <span className="text-surface-400 font-normal">Optional</span>
                    </label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); setFile(e.dataTransfer.files[0]); }}
                      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 group ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-300 dark:border-surface-700'}`}
                    >
                      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${file ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'}`}>
                          {file ? <HiOutlineDocumentAdd className="text-2xl" /> : <HiOutlineUpload className="text-2xl" />}
                        </div>
                        {file ? (
                          <p className="text-sm font-bold text-primary-600">{file.name}</p>
                        ) : (
                          <p className="text-xs text-surface-500 font-bold">Upload supporting documents (PDF/JPG)</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-surface-200 dark:border-surface-800 flex gap-4">
                   <button type="button" onClick={() => setStep(1)} className="btn-secondary py-4 w-1/3 text-xs tracking-widest uppercase font-black">Back</button>
                   <button type="submit" disabled={submitting} className="btn-primary py-4 w-2/3 flex justify-center items-center gap-2 text-xs tracking-widest uppercase font-black">
                    {submitting ? 'Processing...' : 'Submit Claim Request'}
                   </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card overflow-hidden animate-fade-in divide-y divide-surface-100 dark:divide-surface-800/60">
            {claims.length === 0 ? (
              <EmptyState 
                icon={HiOutlineDocumentText}
                title="No claims filed yet"
                description="Keep your claims organized and trace their progress here."
                actionLabel="File a New Claim"
                onClick={() => setShowForm(true)}
              />
            ) : (
              paginatedClaims.map(claim => (
                <div key={claim.claimId} className="p-6 sm:p-8 hover:bg-surface-50 dark:hover:bg-surface-800/10 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-lg group-hover:bg-primary-500/10 transition-colors">
                          <HiOutlineDocumentText className="text-xl text-surface-500 group-hover:text-primary-500" />
                        </div>
                        <h3 className="font-black text-lg text-surface-900 dark:text-white tracking-tight">
                          {allPolicies.find(p => p.id === claim.policyId)?.policyName || `Claim ${claim.claimId}`}
                        </h3>
                        <StatusBadge status={claim.status} />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-surface-500">
                         <div className="flex items-center gap-1.5 font-medium">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           <span>Claim Amount: <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{(claim.claimAmount||0).toLocaleString()}</span></span>
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-surface-100/50 dark:bg-surface-900/40 p-4 rounded-xl text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed italic border border-surface-200 dark:border-surface-800/50">
                          "{claim.description || claim.message}"
                        </div>
                        
                          <div className="flex items-center gap-2 lg:ml-4">
                            <button 
                              onClick={() => handleView(claim.claimId)}
                              title="View Document"
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-500 hover:text-primary-500 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all active:scale-95"
                            >
                               <HiOutlineEye className="text-xl" />
                            </button>
                            <button 
                              onClick={() => handleDownload(claim.claimId)}
                              title="Download Document"
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-500 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all active:scale-95"
                            >
                               <HiOutlineDownload className="text-xl" />
                            </button>

                             <button 
                               onClick={async () => {
                                 if (window.confirm('Delete this claim? This action cannot be undone.')) {
                                   try {
                                     await claimService.deleteClaim(claim.claimId)
                                     toast.success('Claim deleted successfully')
                                     fetchData()
                                   } catch (err) { toast.error('Failed to delete claim') }
                                 }
                               }}
                               title="Delete Claim"
                               className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white dark:bg-red-500/10 dark:hover:bg-red-500 transition-all shadow-sm active:scale-95"
                             >
                               <HiOutlineX className="text-xl" />
                             </button>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Pagination 
             currentPage={currentPage}
             totalItems={claims.length}
             itemsPerPage={itemsPerPage}
             onPageChange={setCurrentPage}
             onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </div>
  )
}
