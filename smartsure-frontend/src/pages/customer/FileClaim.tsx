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
  HiOutlineShieldCheck,
  HiArrowRight,
} from 'react-icons/hi'
import { RiCoinLine } from 'react-icons/ri'
import { FormInput } from '../../components/common/FormInput'
import { FormTextarea } from '../../components/common/FormTextarea'
import { FormRadio } from '../../components/common/FormRadio'
import { FormFileUpload } from '../../components/common/FormFileUpload'
import { Button } from '../../components/common/Button'

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


  const onSubmit = async (data: ClaimInput) => {
    if (!user?.id) return

    // Business Rule Check: Claim amount cannot exceed the premium amount
    const selectedPolicy = policies.find(p => p.id.toString() === data.policyId.toString());
    if (selectedPolicy && selectedPolicy.coverageAmount && Number(data.amount) > selectedPolicy.coverageAmount) {
        toast.error(`The claim amount is greater than the total coverage amount (₹${selectedPolicy.coverageAmount.toLocaleString()}) of this policy.`);
        return;
    }

    setSubmitting(true)
    
    // Convert policyId to Number
    const payload = {
      policyId: Number(data.policyId),
      userId: user.id,
      claimAmount: Number(data.amount),
      description: data.description,
    }

    const response = await claimService.initiateClaim(payload)

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
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-surface-500 dark:text-surface-400 pl-1 mb-2">
                Target Policy
              </label>
              <div className="space-y-3">
                {policies.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedPolicyId === p.id.toString()
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 shadow-xl shadow-primary-500/5 ring-4 ring-primary-500/5'
                        : 'border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-900/40'
                    }`}
                    onClick={() => setValue('policyId', p.id.toString())}
                  >
                    <FormRadio
                      label={p.policyName}
                      description={`ID: ${p.id} • Premium: ₹${p.premiumAmount?.toLocaleString()} • Coverage: ₹${p.coverageAmount?.toLocaleString()}`}
                      checked={selectedPolicyId === p.id.toString()}
                      {...register('policyId')}
                      value={p.id.toString()}
                    />
                  </div>
                ))}
              </div>
              {errors.policyId && (
                <p className="mt-2 text-[11px] font-bold text-red-500 pl-1">{errors.policyId.message}</p>
              )}
            </div>

            <Button
              onClick={handleNext}
              fullWidth
              size="lg"
              className="mt-8 group shadow-xl shadow-primary-500/10"
              rightIcon={<HiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />}
            >
              Continue to Incident Details
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <FormInput
                type="number"
                step="0.01"
                label="Claim Request Amount"
                placeholder="50000"
                leftIcon={<RiCoinLine />}
                error={errors.amount?.message}
                {...register('amount')}
              />

              <FormTextarea
                label="Comprehensive Incident Description"
                placeholder="Provide a detailed account of the incident, including dates, individuals involved, and exact damages..."
                rows={5}
                error={errors.description?.message}
                {...register('description')}
              />

              <FormFileUpload
                label="Supporting Evidence"
                helperText="PDF, JPG, PNG (Max 10MB)"
                value={uploadedFile}
                onChange={(file) => setValue('file', file)}
                error={errors.file?.message as string}
              />
            </div>

            <div className="pt-8 border-t border-surface-200 dark:border-surface-800 flex gap-4">
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
                isLoading={submitting}
                className="w-2/3"
                size="lg"
              >
                {submitting ? 'Processing Claim...' : 'Submit Claim Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
