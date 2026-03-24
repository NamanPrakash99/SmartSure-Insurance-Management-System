import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { policyService } from '../../api/policyService'
import { paymentService } from '../../api/paymentService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { HiOutlineShieldCheck, HiOutlineSearch, HiOutlineCreditCard, HiOutlineFilter } from 'react-icons/hi'
import { toast } from 'react-toastify'

export default function BrowsePolicies() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [policies, setPolicies] = useState([])
  const [userPolicies, setUserPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')

  useEffect(() => {
    fetchPolicies()
    if (user?.id) {
      fetchUserPolicies()
    }
  }, [user?.id])

  const fetchPolicies = async () => {
    try {
      const { data } = await policyService.getAllPolicies()
      setPolicies(data)
    } catch (error) {
      toast.error('Failed to load policies')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPolicies = async () => {
    try {
      const { data } = await policyService.getUserPolicies(user.id)
      setUserPolicies(data || [])
    } catch (error) {
      console.error("Failed to fetch user policies", error)
    }
  }

  const handlePurchase = async (policy) => {
    // 0. Check if user already owns this policy and it's ACTIVE
    const alreadyOwned = userPolicies.some(up => 
      up.policyName === policy.policyName && up.status === 'ACTIVE'
    )

    if (alreadyOwned) {
      toast.warning(`You already have an active subscription for ${policy.policyName}`)
      return
    }

    setProcessing(true)
    try {
      const orderData = {
        userId: user.id,
        policyId: policy.id,
        amount: policy.premiumAmount
      }
      
      const { data: orderResponse } = await paymentService.createOrder(orderData)

      const options = {
        key: 'rzp_test_SUGz2hbfTwDAHc',
        amount: (policy.premiumAmount * 100).toString(),
        currency: 'INR',
        name: 'SmartSure Insurance',
        description: `Premium for ${policy.policyName}`,
        order_id: orderResponse.orderId,
        handler: async function (response) {
          try {
            const verifyData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }
            await paymentService.verifyPayment(verifyData)
            await policyService.purchasePolicy(policy.id)

            toast.success('Payment successful! Policy purchased.')
            navigate('/my-policies')
          } catch (err) {
            toast.error('Payment verification failed')
            console.error(err)
            setProcessing(false)
          }
        },
        prefill: {
          name: user.name || 'Customer',
          email: user.email || 'customer@example.com'
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false)
            toast.info('Payment cancelled')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response){
        toast.error(response.error.description || 'Payment Failed')
        setProcessing(false)
      })
      rzp.open()

    } catch (error) {
      toast.error(error.response?.data || 'Failed to initiate payment')
      setProcessing(false)
    }
  }

  // Derive unique categories dynamically from policies to ensure they always match the database
  const categories = useMemo(() => {
    const cats = new Set(['ALL'])
    policies.forEach(p => {
      if (p.category) {
        cats.add(p.category.toUpperCase())
      }
    })
    // If no policies yet, default to the known backend categories
    if (cats.size === 1) {
       ['HEALTH', 'VEHICLE', 'LIFE'].forEach(c => cats.add(c))
    }
    return Array.from(cats)
  }, [policies])

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.policyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Exact match with backend category enum (HEALTH, VEHICLE, LIFE)
    const matchesFilter = activeFilter === 'ALL' || (p.category?.toUpperCase() === activeFilter.toUpperCase())
    
    return matchesSearch && matchesFilter
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div className="max-w-xl">
          <h1 className="section-title text-3xl sm:text-4xl mb-2">Available Coverages</h1>
          <p className="text-surface-500 font-medium">Browse and secure the right insurance plans tailored for your peace of mind.</p>
        </div>
        
        <div className="relative w-full md:w-80 shrink-0">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
          <input 
            type="text" 
            placeholder="Search tailored plans..." 
            className="input-field !pl-11 !py-3 bg-white dark:bg-surface-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips - Mock visual enhancement for premium feel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-surface-200 dark:border-surface-700 mr-2 text-surface-400">
          <HiOutlineFilter />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Filters</span>
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 shrink-0 ${
              activeFilter === cat 
                ? 'bg-surface-900 text-white dark:bg-white dark:text-surface-900 shadow-md' 
                : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:border-primary-500/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredPolicies.length === 0 ? (
         <EmptyState 
           icon={HiOutlineSearch}
           title="No packages found"
           description="Try adjusting your search terms or selecting a different filter category."
         />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy, idx) => (
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
                
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{policy.policyName}</h3>
                <p className="text-surface-500 dark:text-surface-400 text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                  {policy.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-surface-50 dark:bg-surface-900 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-xl relative">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Premium</p>
                    <p className="font-extrabold text-primary-600 dark:text-primary-400 text-xl tracking-tight">₹{(policy.premiumAmount || 0).toLocaleString()}<span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest ml-1">/mo</span></p>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-900 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-xl relative">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Coverage</p>
                    <p className="font-extrabold text-surface-900 dark:text-white text-xl tracking-tight">₹{((policy.coverageAmount || 0)/100000).toFixed(1)}L</p>
                  </div>
                </div>
              </div>
              <div className="px-6 md:px-8 pb-6 pt-0 flex gap-3 z-10">
                <Link 
                  to={`/policies/${policy.id}`} 
                  className="flex-1 btn-ghost border border-surface-200 dark:border-surface-700 text-sm !py-3 text-center transition-all duration-300"
                >
                  View Terms
                </Link>
                <button 
                  onClick={() => handlePurchase(policy)}
                  disabled={processing}
                  className="flex-1 btn-primary text-sm !py-3 flex items-center justify-center gap-2 group/btn"
                >
                  <HiOutlineCreditCard className="text-lg group-hover/btn:scale-110 transition-transform" />
                  <span>Purchase</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
