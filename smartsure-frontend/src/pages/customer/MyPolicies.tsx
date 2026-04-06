import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { policyService } from '../../api/policyService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { Pagination } from '../../components/common/Pagination'
import { paymentService } from '../../api/paymentService'
import {
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi'
import { Modal } from '../../components/common/Modal'
import { UserPolicy } from '../../types'
import { Button } from '../../components/common/Button'

// Extend window object for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function MyPolicies() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState<UserPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedPolicyForRenewal, setSelectedPolicyForRenewal] = useState<UserPolicy | null>(null)

  const paginatedPolicies = policies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    if (user) {
      fetchPolicies()
    }
  }, [user?.id])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const fetchPolicies = async () => {
    if (!user) return
    const [userPoliciesRes, allAvailablePoliciesRes] = await Promise.all([
      policyService.getUserPolicies(user.id),
      policyService.getAllPolicies(),
    ])

    const allAvailablePolicies = allAvailablePoliciesRes.success ? allAvailablePoliciesRes.data : []

    if (userPoliciesRes.success) {
      let data = userPoliciesRes.data || []
      // Manually map policy details if missing
      data = data.map((up) => {
        if (!up.policy && allAvailablePolicies.length > 0) {
          const found = allAvailablePolicies.find((p) => p.id === up.policyId)
          if (found) return { ...up, policy: found }
        }
        return up
      })
      setPolicies(data)
    }
    setLoading(false)
  }

  const handleCompletePayment = async (policy: UserPolicy) => {
    if (!user) return
    const orderData = {
      userId: user.id,
      policyId: policy.policyId,
      amount: policy.premiumAmount,
      userPolicyId: policy.id,
    }

    const orderRes = await paymentService.createOrder(orderData)
    if (!orderRes.success) {
      toast.error(orderRes.message || 'Failed to create payment order')
      return
    }
    const orderResponse = orderRes.data

    const options = {
      key: 'rzp_test_SUGz2hbfTwDAHc',
      amount: ((policy.premiumAmount || 0) * 100).toString(),
      currency: 'INR',
      name: 'SmartSure Insurance',
      description: `Premium for ${policy.policy?.name || 'Policy'}`,
      order_id: orderResponse.orderId,
      handler: async function (response: any) {
        const verifyData = {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }
        const verifyRes = await paymentService.verifyPayment(verifyData)
        if (verifyRes.success) {
          toast.success('Payment verified! Your policy will be active shortly.')
          setSelectedPolicyForRenewal(null)
          setTimeout(() => {
            fetchPolicies()
          }, 2000)
        } else {
          toast.error(verifyRes.message || 'Payment verification failed')
        }
      },
      prefill: {
        name: user.name || 'Customer',
        email: user.email || 'customer@example.com',
      },
      theme: {
        color: '#6366f1',
      },
      modal: {
        ondismiss: async function () {
          toast.info('Payment cancelled')
          await paymentService.verifyPayment({
            razorpayOrderId: orderResponse.orderId,
            razorpayPaymentId: 'CANCELLED',
            razorpaySignature: 'INVALID',
          })
          fetchPolicies()
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', async function (response: any) {
      toast.error(response.error.description || 'Payment Failed')
      await paymentService.verifyPayment({
        razorpayOrderId: response.error.metadata.order_id,
        razorpayPaymentId: response.error.metadata.payment_id,
        razorpaySignature: 'FAILED',
      })
      fetchPolicies()
    })
    rzp.open()
  }

  const handleDeletePolicy = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to remove this policy record?')) return

    const response = await policyService.deleteUserPolicy(id)
    if (response.success) {
      toast.success('Policy removed')
      fetchPolicies()
    } else {
      toast.error(response.message || 'Failed to delete policy')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="section-title text-3xl sm:text-4xl mb-2">My Policies</h1>
          <p className="text-surface-500 font-medium">
            Manage all your active and expired insurance protection plans in one place.
          </p>
        </div>
        <Link
          to="/policies"
          className="shrink-0"
        >
          <Button
            size="lg"
            leftIcon={<HiOutlineShieldCheck className="text-lg" />}
          >
            Secure New Policy
          </Button>
        </Link>
      </div>

      {policies.length === 0 ? (
        <EmptyState
          icon={HiOutlineShieldCheck}
          title="No Active Coverages"
          description="It looks like you haven't secured any policies yet. Don't leave your future to chance."
          actionLabel="Explore Plans"
          actionTo="/policies"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPolicies.map((policy, idx) => {
            const nextDueDate = policy.nextPaymentDueDate
              ? new Date(policy.nextPaymentDueDate)
              : (() => {
                  const startDate = new Date(policy.startDate || Date.now())
                  const fallback = new Date(startDate)
                  fallback.setMonth(fallback.getMonth() + 1)
                  return fallback
                })()

            return (
              <div
                key={policy.id}
                className="card group hover:scale-[1.02] transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${(idx % 6) * 100}ms` }}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
                      <HiOutlineShieldCheck className="text-2xl" />
                    </div>
                    <StatusBadge status={policy.status} />
                  </div>

                  <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 line-clamp-1">
                    {policy.policy?.name || policy.policy?.policyName || 'Policy ' + policy.id}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-sm font-medium text-surface-400">Premium:</span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      ₹{(policy.premiumAmount || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-surface-400">/mo</span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed border-surface-200 dark:border-surface-700">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-surface-500 font-medium">Next Due Date:</span>
                      <span className="text-surface-900 dark:text-white font-bold">
                        {nextDueDate.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-surface-500 font-medium">Completion Date:</span>
                      <span className="text-surface-900 dark:text-white font-bold">
                        {policy.endDate
                          ? new Date(policy.endDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-6 pt-0 flex flex-col gap-3">
                  <Link
                    to="/my-claims"
                    state={{ policyId: policy.id, policyName: policy.policy?.name }}
                    className="w-full"
                  >
                    <Button
                      variant="ghost"
                      fullWidth
                      className="border border-surface-200 dark:border-surface-700 font-bold"
                    >
                      File a Claim
                    </Button>
                  </Link>
                  {policy.status === 'PENDING_PAYMENT' ? (
                    <Button
                      onClick={() => handleCompletePayment(policy)}
                      fullWidth
                      className="!bg-amber-500 !hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                      leftIcon={<HiOutlineCreditCard className="text-lg" />}
                    >
                      Complete Payment
                    </Button>
                  ) : (
                    policy.status !== 'CANCELLED' && (
                      <Button
                        onClick={() => setSelectedPolicyForRenewal(policy)}
                        fullWidth
                        className="shadow-lg shadow-primary-500/20"
                      >
                        Renew Policy
                      </Button>
                    )
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => handleDeletePolicy(policy.id)}
                    fullWidth
                    className="border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/10"
                    leftIcon={<HiOutlineTrash className="text-lg" />}
                  >
                    Remove Record
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={policies.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <Modal
        isOpen={!!selectedPolicyForRenewal}
        onClose={() => setSelectedPolicyForRenewal(null)}
        title="Policy Renewal"
      >
        {selectedPolicyForRenewal && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-500/20">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <HiOutlineCalendar className="text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-white">
                  {selectedPolicyForRenewal.policy?.name || 'Policy'}
                </h4>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider">
                  Premium Installment
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-surface-100 dark:border-surface-800">
                <span className="text-sm text-surface-500 font-medium">Monthly Installment:</span>
                <div className="flex items-center gap-1 text-surface-900 dark:text-white font-black">
                  <HiOutlineCurrencyRupee className="text-lg text-primary-500" />
                  <span>{(selectedPolicyForRenewal.premiumAmount || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-surface-100 dark:border-surface-800 font-black">
                <span className="text-sm text-surface-500">Total Due Now:</span>
                <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-xl">
                  <HiOutlineCurrencyRupee className="text-xl" />
                  <span>{(selectedPolicyForRenewal.premiumAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl text-xs text-surface-500 leading-relaxed italic border border-surface-200 dark:border-surface-700/50">
              "Renewing your policy ensures uninterrupted protection. The payment will be processed
              securely via Razorpay."
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={() => handleCompletePayment(selectedPolicyForRenewal)}
                fullWidth
                size="lg"
                leftIcon={<HiOutlineCreditCard className="text-xl" />}
              >
                Proceed to Payment
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedPolicyForRenewal(null)}
                fullWidth
                className="text-surface-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
