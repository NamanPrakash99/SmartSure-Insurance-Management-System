import React, { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../context/AuthContext'
import { claimService } from '../../api/claimService'
import { policyService } from '../../api/policyService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import {
  HiOutlineDownload,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineUpload,
  HiOutlineDocumentAdd,
  HiArrowRight,
  HiOutlineEye,
  HiOutlineClipboardList,
} from 'react-icons/hi'
import { toast } from 'react-toastify'
import { Pagination } from '../../components/common/Pagination'
import { claimSchema, ClaimInput } from '../../schemas/claimSchema'
import { Claim, UserPolicy } from '../../types'
import { FormInput } from '../../components/common/FormInput'
import { FormTextarea } from '../../components/common/FormTextarea'
import { Button } from '../../components/common/Button'

export default function MyClaims() {
  const { user } = useAuth()
  const location = useLocation()
  const defaultPolicyId = location.state?.policyId?.toString() || ''

  const [claims, setClaims] = useState<Claim[]>([])
  const [policies, setPolicies] = useState<UserPolicy[]>([])
  const [allPolicies, setAllPolicies] = useState<UserPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(!!defaultPolicyId)
  const [step, setStep] = useState(defaultPolicyId ? 2 : 1)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Form State
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClaimInput>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      policyId: defaultPolicyId,
      amount: '',
      description: '',
    },
  })

  // Watch policyId for step 1 validation
  const watchedPolicyId = watch('policyId')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user?.id])

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    const [claimsRes, policiesRes, allAvailablePoliciesRes] = await Promise.all([
      claimService.getClaimsByUser(user.id),
      policyService.getUserPolicies(user.id),
      policyService.getAllPolicies(),
    ])

    const allAvailablePolicies = allAvailablePoliciesRes.success ? allAvailablePoliciesRes.data : []

    if (claimsRes.success) setClaims(claimsRes.data || [])
    if (policiesRes.success) {
      let data = policiesRes.data || []
      // Manually map policy details if missing
      data = data.map((up) => {
        if (!up.policy && allAvailablePolicies.length > 0) {
          const found = allAvailablePolicies.find((p) => p.id === up.policyId)
          if (found) return { ...up, policy: found }
        }
        return up
      })
      setAllPolicies(data)
      setPolicies(data.filter((p) => p.status === 'ACTIVE' || p.status === 'EXPIRED'))
    }
    setLoading(false)
  }

  const paginatedClaims = useMemo(() => {
    return claims.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  }, [claims, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [claims.length, showForm, itemsPerPage])

  const handleDownload = async (claimId: string | number) => {
    const res = await claimService.downloadDocument(claimId)
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
      toast.error('Could not download document.')
    }
  }

  const handleView = async (claimId: string | number) => {
    const res = await claimService.downloadDocument(claimId)
    if (res.success) {
      const contentType = (res as any).headers?.['content-type'] || 'application/octet-stream'
      const url = window.URL.createObjectURL(new Blob([res.data], { type: contentType }))
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } else {
      toast.error('Could not view document.')
    }
  }

  const onSubmit = async (data: ClaimInput) => {
    if (!user) return

    // Business Rule Check: Claim amount cannot exceed the premium amount
    const selectedPolicy = policies.find(p => p.id.toString() === data.policyId.toString());
    if (selectedPolicy && selectedPolicy.coverageAmount && Number(data.amount) > selectedPolicy.coverageAmount) {
      toast.error(`The claim amount is greater than the total coverage amount (₹${selectedPolicy.coverageAmount.toLocaleString()}) of this policy.`);
      return;
    }

    const claimData: Partial<Claim> = {
      policyId: Number(data.policyId),
      userId: Number(user.id),
      claimAmount: Number(data.amount),
      description: data.description,
    }

    const initiateRes = await claimService.initiateClaim(claimData)

    if (initiateRes.success) {
      const claimId = initiateRes.data.claimId || initiateRes.data.id
      if (file && claimId) {
        await claimService.uploadDocument(claimId, file)
      }
      toast.success('Claim submitted successfully')
      setShowForm(false)
      resetForm()
      fetchData()
    } else {
      toast.error(initiateRes.message || 'Failed to submit claim')
    }
  }

  const resetForm = () => {
    reset({
      policyId: '',
      amount: '',
      description: '',
    })
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
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            leftIcon={<HiOutlinePlus className="text-lg" />}
          >
            File New Claim
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              setShowForm(false)
              resetForm()
            }}
            size="lg"
            leftIcon={<HiOutlineArrowLeft className="text-lg" />}
          >
            Back to Claims History
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="max-w-3xl mx-auto space-y-8 mt-10">
          <div className="flex items-center justify-center max-w-md mx-auto mb-8 animate-fade-in">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
                  step >= 1
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-surface-200 text-surface-400'
                }`}
              >
                1
              </div>
              <span
                className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${
                  step >= 1 ? 'text-primary-600' : 'text-surface-400'
                }`}
              >
                Policy
              </span>
            </div>
            <div
              className={`flex-1 h-1 mx-4 rounded-full transition-colors duration-500 ${
                step >= 2 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-800'
              }`}
            />
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${
                  step >= 2
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-surface-200 dark:bg-surface-800 text-surface-400'
                }`}
              >
                2
              </div>
              <span
                className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${
                  step >= 2 ? 'text-primary-600' : 'text-surface-400'
                }`}
              >
                Details
              </span>
            </div>
          </div>

          <div className="card-glass p-6 md:p-10 animate-slide-up">
            {step === 1 ? (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">
                    Target Policy
                  </label>
                  {policies.length === 0 ? (
                    <div className="p-8 text-center bg-surface-50 dark:bg-surface-900/40 rounded-2xl border border-dashed border-surface-200 dark:border-surface-700">
                      <p className="text-surface-500 text-sm mb-4">
                        No active policies eligible for a claim.
                      </p>
                      <a href="/policies" className="text-primary-600 font-bold hover:underline">
                        Browse New Policies
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {policies.map((p) => (
                        <label
                          key={p.id}
                          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                            watchedPolicyId === p.id.toString()
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-1 ring-primary-500/50'
                              : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                          }`}
                        >
                          <input
                            type="radio"
                            {...register('policyId')}
                            value={p.id}
                            className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-surface-300 dark:border-surface-600 dark:bg-surface-900"
                          />
                          <div className="ml-4 flex-1">
                            <span className="block font-bold text-surface-900 dark:text-white">
                              {p.policy?.name || p.policy?.policyName || 'Policy ' + p.id}
                            </span>
                            <span className="block text-xs text-surface-500 font-mono mt-0.5">
                              ID: {p.id} • Premium: ₹{p.premiumAmount?.toLocaleString()} • Coverage: ₹{p.coverageAmount?.toLocaleString()}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!watchedPolicyId}
                  fullWidth
                  size="lg"
                  className="mt-8 group"
                  rightIcon={<HiArrowRight className="text-lg" />}
                >
                  Continue to Incident Details
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <FormInput
                    type="number"
                    label="Claim Request Amount (₹)"
                    leftIcon={<span className="font-bold text-surface-400">₹</span>}
                    error={errors.amount?.message}
                    {...register('amount')}
                  />

                  <FormTextarea
                    label="Incident Description"
                    placeholder="Describe what happened..."
                    rows={4}
                    error={errors.description?.message}
                    {...register('description')}
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2 flex justify-between">
                      <span>Supporting Evidence</span>
                      <span className="text-surface-400 font-normal">Optional</span>
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      // @ts-ignore
                      onDrop={(e: React.DragEvent) => {
                        e.preventDefault()
                        setIsDragging(false)
                        setFile(e.dataTransfer.files[0])
                      }}
                      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 group ${
                        isDragging
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-surface-300 dark:border-surface-700'
                      }`}
                    >
                      <input
                        type="file"
                        onChange={(e: any) => setFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center text-center">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                            file
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
                          }`}
                        >
                          {file ? (
                            <HiOutlineDocumentAdd className="text-2xl" />
                          ) : (
                            <HiOutlineUpload className="text-2xl" />
                          )}
                        </div>
                        {file ? (
                          <p className="text-sm font-bold text-primary-600">{file.name}</p>
                        ) : (
                          <p className="text-xs text-surface-500 font-bold">
                            Upload supporting documents (PDF/JPG)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-surface-200 dark:border-surface-800 flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="w-1/3"
                    size="lg"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-2/3"
                    size="lg"
                  >
                    Submit Claim Request
                  </Button>
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
              paginatedClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-6 sm:p-8 hover:bg-surface-50 dark:hover:bg-surface-800/10 transition-colors group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-lg group-hover:bg-primary-500/10 transition-colors">
                          <HiOutlineDocumentText className="text-xl text-surface-500 group-hover:text-primary-500" />
                        </div>
                        <h3 className="font-black text-lg text-surface-900 dark:text-white tracking-tight">
                          {(() => {
                            const p = allPolicies.find((p) => p.id === claim.policyId)
                            return (
                              p?.policy?.name || p?.policy?.policyName || `Claim ${claim.claimId || claim.id}`
                            )
                          })()}
                        </h3>
                        <StatusBadge status={claim.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-surface-500">
                        <div className="flex items-center gap-1.5 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>
                            Claim Amount:{' '}
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ₹
                              {(claim.amount || claim.claimAmount || 0).toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="flex-1 space-y-3">
                          <div className="bg-surface-100/50 dark:bg-surface-900/40 p-4 rounded-xl text-xs sm:text-sm text-surface-600 dark:text-surface-300 leading-relaxed italic border border-surface-200 dark:border-surface-800/50">
                            <span className="block text-[10px] font-bold uppercase tracking-tighter text-surface-400 mb-1 non-italic">My Description</span>
                            "{claim.description}"
                          </div>
                          
                          {(claim.remark || claim.remarks) && (
                            <div className="bg-primary-500/5 dark:bg-primary-500/10 p-4 rounded-xl text-xs sm:text-sm text-primary-900 dark:text-primary-100 leading-relaxed border border-primary-500/20 shadow-sm animate-fade-in">
                              <div className="flex items-center gap-2 mb-1.5">
                                <HiOutlineClipboardList className="text-primary-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">Admin Remarks</span>
                              </div>
                              <p className="font-semibold">{claim.remark || claim.remarks}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 lg:ml-4">
                          <Button
                            variant="secondary"
                            onClick={() => handleView(claim.claimId || claim.id)}
                            title="View Document"
                            className="w-10 h-10 !p-0"
                            leftIcon={<HiOutlineEye className="text-xl" />}
                          />
                          <Button
                            variant="secondary"
                            onClick={() => handleDownload(claim.claimId || claim.id)}
                            title="Download Document"
                            className="w-10 h-10 !p-0"
                            leftIcon={<HiOutlineDownload className="text-xl" />}
                          />
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
