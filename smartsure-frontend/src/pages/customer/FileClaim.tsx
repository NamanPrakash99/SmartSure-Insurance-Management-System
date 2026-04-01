import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../context/AuthContext'
import { policyService } from '../../api/policyService'
import { claimService } from '../../api/claimService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { claimSchema, ClaimInput } from '../../schemas/claimSchema'
import { toast } from 'react-toastify'
import {
  HiOutlineUpload,
  HiOutlineDocumentAdd,
  HiOutlineShieldCheck,
  HiArrowRight,
} from 'react-icons/hi'

export default function FileClaim() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const defaultPolicyId = location.state?.policyId || ''

  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ClaimInput>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      policyId: defaultPolicyId.toString(),
      amount: '',
      description: '',
    },
  })

  const selectedPolicyId = watch('policyId')
  const uploadedFile = watch('file')

  // Drag State
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!user?.id) return
      const response = await policyService.getUserPolicies(user.id)
      if (response.success) {
        setPolicies(response.data.filter((p: any) => p.status === 'ACTIVE' || p.status === 'EXPIRED'))
      } else {
        toast.error('Failed to load your policies')
      }
      setLoading(false)
    }
    fetchPolicies()
  }, [user?.id])

  const handleNext = async () => {
    const isValid = await trigger('policyId')
    if (isValid) {
      setStep(2)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setValue('file', e.dataTransfer.files[0])
    }
  }

  const onSubmit = async (data: ClaimInput) => {
    if (!user?.id) return
    setSubmitting(true)

    const response = await claimService.initiateClaim({
      policyId: Number(data.policyId),
      userId: user.id,
      claimAmount: Number(data.amount),
      description: data.description,
    })

    if (response.success) {
      const claimId = (response.data as any).claimId
      if (data.file && claimId) {
        const uploadRes = await claimService.uploadDocument(claimId, data.file)
        if (!uploadRes.success) {
          toast.warning('Claim initiated, but document upload failed. You can retry from My Claims.')
        }
      }
      toast.success('Claim submitted successfully')
      navigate('/my-claims')
    } else {
      toast.error(response.message || 'Failed to submit claim')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>

  if (policies.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <EmptyState
          title="Ineligible for Claims"
          description="You don't have any active or recently expired policies that are eligible for a claim."
          icon={HiOutlineShieldCheck}
          actionLabel="Browse Policies"
          actionTo="/policies"
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="animate-fade-in text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight text-surface-900 dark:text-white mb-3">
          Initiate a Claim
        </h1>
        <p className="text-surface-500 font-medium max-w-lg mx-auto">
          Submit your incident report and supporting evidence for rapid automated processing.
        </p>
      </div>

      {/* Progress Stepper */}
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
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">
                Target Policy
              </label>
              <div className="space-y-3">
                {policies.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedPolicyId === p.id.toString()
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-1 ring-primary-500/50'
                        : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('policyId')}
                      value={p.id.toString()}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-surface-300 dark:border-surface-600 dark:bg-surface-900"
                    />
                    <div className="ml-4 flex-1">
                      <span className="block font-bold text-surface-900 dark:text-white">
                        {p.policyName}
                      </span>
                      <span className="block text-xs text-surface-500 font-mono mt-0.5">
                        ID: {p.id} • Premium: ₹{p.premiumAmount}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.policyId && (
                <p className="mt-2 text-xs font-medium text-red-500">{errors.policyId.message}</p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full btn-primary py-4 mt-8 flex justify-center items-center gap-2 group"
            >
              Continue to Incident Details
              <HiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">
                  Claim Request Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-surface-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50000"
                    className={`input-field !pl-10 text-lg font-bold ${
                      errors.amount ? 'border-red-500 focus:ring-red-500/10' : ''
                    }`}
                    {...register('amount')}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">
                  Comprehensive Incident Description
                </label>
                <textarea
                  placeholder="Provide a detailed account of the incident, including dates, individuals involved, and exact damages..."
                  className={`input-field h-40 resize-none leading-relaxed ${
                    errors.description ? 'border-red-500 focus:ring-red-500/10' : ''
                  }`}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2 flex justify-between">
                  <span>Supporting Evidence</span>
                  <span className="text-surface-400 font-normal">Optional</span>
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 group ${
                    isDragging
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
                      : 'border-surface-300 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/30'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setValue('file', e.target.files[0])
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 ${
                        uploadedFile || isDragging
                          ? 'bg-primary-100 dark:bg-primary-900/40 scale-110'
                          : 'bg-surface-100 dark:bg-surface-800'
                      }`}
                    >
                      {uploadedFile ? (
                        <HiOutlineDocumentAdd className="text-primary-600 text-3xl animate-bounce-in" />
                      ) : (
                        <HiOutlineUpload className="text-surface-400 text-3xl group-hover:-translate-y-1 transition-transform" />
                      )}
                    </div>

                    {uploadedFile ? (
                      <div className="animate-fade-in">
                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-1">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-surface-500 uppercase tracking-widest">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-surface-900 dark:text-white mb-1">
                          Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-surface-500">
                          Supported formats: PDF, JPG, PNG (Max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-surface-200 dark:border-surface-800 flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary py-4 w-1/3">
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary py-4 w-2/3 flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Processing Claim...</span>
                  </>
                ) : (
                  'Submit Claim Request'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
