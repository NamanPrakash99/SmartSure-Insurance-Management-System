import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { policyService } from '../../api/policyService'
import { paymentService } from '../../api/paymentService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { toast } from 'react-toastify'
import { HiArrowLeft, HiOutlineShieldCheck, HiOutlineCheck } from 'react-icons/hi'

export default function PolicyDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data } = await policyService.getPolicy(id)
        setPolicy(data)
      } catch (error) {
        toast.error('Policy not found')
        navigate('/policies')
      } finally {
        setLoading(false)
      }
    }
    fetchPolicy()
  }, [id, navigate])

  const handlePurchase = async () => {
    setProcessing(true)
    try {
      // 1. Create Razorpay order via backend
      const orderData = {
        userId: user.id,
        policyId: parseInt(id),
        amount: policy.premiumAmount
      }
      
      const { data: orderResponse } = await paymentService.createOrder(orderData)

      // 2. Open Razorpay Checkout modal
      const options = {
        key: 'rzp_test_SUGz2hbfTwDAHc', // Test Key, could be fetched from backend or env
        amount: (policy.premiumAmount * 100).toString(),

        currency: 'INR',
        name: 'SmartSure Insurance',
        description: `Premium for ${policy.policyName}`,
        order_id: orderResponse.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }
            await paymentService.verifyPayment(verifyData)
            
            // 4. Actually purchase/attach policy to user 
            // Note: In premium setup, this might be redundant if the verifyPayment event triggers it.
            await policyService.purchasePolicy(policy.id)

            toast.success('Payment verified! Policy purchased.')
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
        toast.error(response.error.description)
        setProcessing(false)
      })
      rzp.open()

    } catch (error) {
      toast.error(error.response?.data || 'Failed to initiate payment')
      setProcessing(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!policy) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors group px-2 py-1">
        <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="card overflow-hidden">
        {/* Banner header */}
        <div className="h-32 bg-gradient-to-r from-primary-600 to-accent-500 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="p-8 relative">
          <div className="w-20 h-20 bg-white dark:bg-surface-800 rounded-2xl shadow-xl flex items-center justify-center absolute -top-10 left-8 border-4 border-white dark:border-surface-800">
            <HiOutlineShieldCheck className="text-4xl text-primary-500" />
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surface-200 dark:border-surface-800 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">{policy.policyName}</h1>
              <p className="text-surface-600 dark:text-surface-400 max-w-2xl leading-relaxed">{policy.description}</p>
            </div>
            
            <button 
              onClick={handlePurchase}
              disabled={processing}
              className="btn-primary w-full md:w-auto px-8 py-4 text-lg whitespace-nowrap shadow-primary-500/40 animate-pulse-soft flex items-center justify-center gap-2 min-w-[200px]"
            >
              {processing ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Buy Now Securely'
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
             <div className="bg-surface-50 dark:bg-surface-900/50 p-6 rounded-2xl">
                <p className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-2">Monthly Premium</p>
                <p className="font-bold text-surface-900 dark:text-white text-3xl">
                  ₹{(policy.premiumAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-surface-50 dark:bg-surface-900/50 p-6 rounded-2xl">
                <p className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-2">Total Coverage</p>
                <p className="font-bold text-surface-900 dark:text-white text-3xl">
                  ₹{((policy.coverageAmount || 0)/100000).toFixed(1)}L
                </p>
              </div>
              <div className="bg-surface-50 dark:bg-surface-900/50 p-6 rounded-2xl">
                <p className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-2">Duration</p>
                <p className="font-bold text-surface-900 dark:text-white text-3xl">
                  {policy.durationInMonths} <span className="text-xl font-normal text-surface-500">months</span>
                </p>
              </div>
          </div>

          {/* Benefits section */}
          <div className="mt-12">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Key Benefits Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 "Cashless treatment at network hospitals",
                 "No claim bonus for healthy years",
                 "Comprehensive coverage options",
                 "24x7 customer support access"
               ].map((benefit, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                     <HiOutlineCheck className="text-sm" />
                   </div>
                   <span className="text-surface-700 dark:text-surface-300">{benefit}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
