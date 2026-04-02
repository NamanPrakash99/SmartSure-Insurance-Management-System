import { useState, useEffect, useMemo } from 'react'
import { FormInput } from '../../components/common/FormInput'
import { Button } from '../../components/common/Button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { policyService } from '../../api/policyService'
import { paymentService } from '../../api/paymentService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { HiOutlineShieldCheck, HiOutlineSearch, HiOutlineCreditCard } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { Pagination } from '../../components/common/Pagination'
import { Policy, UserPolicy } from '../../types'
import { useDebounce } from '../../hooks/useDebounce'

// Extend window object for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function BrowsePolicies() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [policies, setPolicies] = useState<Policy[]>([])
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 400)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchPolicies()
    if (user?.id) {
      fetchUserPolicies()
    }
  }, [user?.id])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, activeFilter, itemsPerPage])

  const fetchPolicies = async () => {
    const response = await policyService.getAllPolicies()
    if (response.success) {
      setPolicies(response.data)
    } else {
      toast.error(response.message || 'Failed to load policies')
    }
    setLoading(false)
  }

  const fetchUserPolicies = async () => {
    if (!user) return
    const response = await policyService.getUserPolicies(user.id)
    if (response.success) {
      setUserPolicies(response.data || [])
    }
  }

  const handlePurchase = async (policy: Policy) => {
    if (!user) {
      toast.error('Please log in to purchase a policy')
      navigate('/login')
      return
    }

    // 0. Check if user already owns this specific policy and it's ACTIVE
    const alreadyOwned = userPolicies.some(
      (up) => up.policyId === policy.id && up.status === 'ACTIVE'
    )

    if (alreadyOwned) {
      const policyName = policy.name || policy.policyName || 'this policy'
      toast.warning(`You already have an active subscription for ${policyName}`)
      return
    }

    setProcessingId(policy.id)

    // Step 1: Initialize the Saga on the backend (Creates PENDING_PAYMENT record)
    const purchaseRes = await policyService.purchasePolicy(policy.id)
    if (!purchaseRes.success) {
      toast.error(purchaseRes.message || 'Failed to initiate purchase')
      setProcessingId(null)
      return
    }
    const userPolicy = purchaseRes.data

    // Step 2: Create the Razorpay Order linked to our userPolicyId
    const orderData = {
      userId: user.id,
      policyId: policy.id,
      amount: policy.premiumAmount,
      userPolicyId: userPolicy.id, // Link the payment to the pending policy record
    }

    const orderRes = await paymentService.createOrder(orderData)
    if (!orderRes.success) {
      toast.error(orderRes.message || 'Failed to create payment order')
      setProcessingId(null)
      return
    }
    const orderResponse = orderRes.data

    const options = {
      key: 'rzp_test_SUGz2hbfTwDAHc',
      amount: ((policy.premiumAmount || 0) * 100).toString(),
      currency: 'INR',
      name: 'SmartSure Insurance',
      description: `Premium for ${policy.name}`,
      order_id: orderResponse.orderId,
      handler: async function (response: any) {
        const verifyData = {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }
        // Step 3: Verify on backend
        const verifyRes = await paymentService.verifyPayment(verifyData)
        if (verifyRes.success) {
          toast.success('Payment verified! Policy activated.')
          setTimeout(() => {
            navigate('/my-policies')
          }, 1500)
        } else {
          toast.error(verifyRes.message || 'Payment verification failed')
          setProcessingId(null)
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
        ondismiss: function () {
          setProcessingId(null)
          toast.info('Payment cancelled')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', function (response: any) {
      toast.error(response.error.description || 'Payment Failed')
      setProcessingId(null)
    })
    rzp.open()
  }

  // Derive unique categories dynamically from policies
  const categories = useMemo(() => {
    const cats = new Set(['ALL'])
    policies.forEach((p) => {
      if (p.category) {
        cats.add(p.category.toUpperCase())
      }
    })
    if (cats.size === 1) {
      ;['HEALTH', 'VEHICLE', 'LIFE'].forEach((c) => cats.add(c))
    }
    return Array.from(cats)
  }, [policies])

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const searchLower = debouncedSearchTerm.toLowerCase()
      const nameMatch = p.name?.toLowerCase().includes(searchLower)
      const descMatch = p.description?.toLowerCase().includes(searchLower)
      const matchesSearch = searchLower === '' || nameMatch || descMatch

      const matchesFilter =
        activeFilter === 'ALL' || p.category?.toUpperCase() === activeFilter.toUpperCase()

      return matchesSearch && matchesFilter
    })
  }, [policies, debouncedSearchTerm, activeFilter])

  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPolicies, currentPage, itemsPerPage])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div className="max-w-xl">
          <h1 className="section-title text-3xl sm:text-4xl mb-2">Available Coverages</h1>
          <p className="text-surface-500 font-medium tracking-tight">
            Browse and secure the right insurance plans tailored for your peace of mind.
          </p>
        </div>
      </div>

      {/* Modern Unified AI Pill Toolbar */}
      <div className="ai-gradient-border shadow-2xl overflow-visible w-full">
        <div className="ai-content flex flex-col lg:flex-row items-center gap-6 bg-white dark:bg-surface-900 p-2 rounded-full justify-between px-4">
          {/* Search Pill */}
          <FormInput
            type="text"
            placeholder="Search plans (e.g. Life, Vehicle, Health)..."
            leftIcon={<HiOutlineSearch />}
            containerClassName="flex-1 w-full"
            className="!rounded-full border-none focus:ring-2 focus:ring-primary-500/20 text-sm font-medium placeholder-surface-400 transition-all dark:shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Category Pill */}
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-950/50 p-1 rounded-full border border-surface-200/50 dark:border-surface-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500 shrink-0 ${
                  activeFilter === cat
                    ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-white shadow-xl scale-105'
                    : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredPolicies.length === 0 ? (
        <EmptyState
          icon={HiOutlineSearch}
          title="No packages found"
          description="Try adjusting your search terms or selecting a different filter category."
          actionLabel="Reset Filters"
          onClick={() => {
            setSearchTerm('')
            setActiveFilter('ALL')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPolicies.map((policy, idx) => (
            <div
              key={policy.id}
              className="card group flex flex-col h-full border-2 border-transparent hover:border-primary-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10 animate-fade-in"
              style={{ animationDelay: `${(idx % 6) * 100}ms` }}
            >
              <div className="p-6 md:p-8 flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary-50 dark:bg-primary-900/20 rounded-full group-hover:scale-150 transition-transform duration-700 ease-in-out pointer-events-none" />

                <div className="relative z-10 w-14 h-14 bg-white dark:bg-surface-800 shadow-lg border border-surface-100 dark:border-surface-700 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <HiOutlineShieldCheck className="text-2xl" />
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1 text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 rounded-full shadow-inner ring-1 ring-primary-500/20">
                    {policy.category || 'General'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {policy.name || policy.policyName}
                </h3>
                <p className="text-surface-500 dark:text-surface-400 text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                  {policy.description || policy.policyDescription}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-surface-50 dark:bg-surface-900 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-xl relative">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">
                      Premium
                    </p>
                    <p className="font-extrabold text-primary-600 dark:text-primary-400 text-xl tracking-tight">
                      ₹{(policy.premiumAmount || 0).toLocaleString()}
                      <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest ml-1">
                        /mo
                      </span>
                    </p>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-900 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-xl relative">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">
                      Coverage
                    </p>
                    <p className="font-extrabold text-surface-900 dark:text-white text-xl tracking-tight">
                      ₹{((policy.coverageAmount || 0) / 100000).toFixed(1)}L
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 md:px-8 pb-6 pt-0 flex gap-3 z-10">
                <Link
                  to={`/policies/${policy.id}`}
                  className="flex-1"
                >
                  <Button variant="ghost" fullWidth className="border border-surface-200 dark:border-surface-700">
                    View Terms
                  </Button>
                </Link>
                <Button
                  onClick={() => handlePurchase(policy)}
                  isLoading={processingId === policy.id}
                  disabled={processingId !== null}
                  fullWidth
                  className="flex-1 group/btn"
                  leftIcon={<HiOutlineCreditCard className="text-lg group-hover/btn:scale-110 transition-transform" />}
                >
                  Purchase
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={filteredPolicies.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  )
}
