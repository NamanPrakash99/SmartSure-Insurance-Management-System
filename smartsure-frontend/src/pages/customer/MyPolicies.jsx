import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { policyService } from '../../api/policyService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { HiOutlineShieldCheck } from 'react-icons/hi'
import { Link } from 'react-router-dom'

export default function MyPolicies() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPolicies()
  }, [user.id])

  const fetchPolicies = async () => {
    try {
      const { data } = await policyService.getUserPolicies(user.id)
      setPolicies(data)
    } catch (error) {
      console.error("Failed to load user policies", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="section-title text-3xl sm:text-4xl mb-2">My Policies</h1>
          <p className="text-surface-500 font-medium">Manage all your active and expired insurance protection plans in one place.</p>
        </div>
        <Link to="/policies" className="btn-primary text-sm px-6 py-3 shadow-primary-500/20 flex items-center gap-2 shrink-0">
          <HiOutlineShieldCheck className="text-lg" />
          Secure New Policy
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
          {policies.map((policy, idx) => {
            // Calculate mock next due date (approx 1 month from start or next month if already past)
            const startDate = new Date(policy.startDate || Date.now())
            const nextDueDate = new Date(startDate)
            nextDueDate.setMonth(nextDueDate.getMonth() + 1)
            
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
                  
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 line-clamp-1">{policy.policyName}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-sm font-medium text-surface-400">Premium:</span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">₹{(policy.premiumAmount || 0).toLocaleString()}</span>
                    <span className="text-[10px] uppercase font-bold text-surface-400">/mo</span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed border-surface-200 dark:border-surface-700">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-surface-500 font-medium">Next Due Date:</span>
                       <span className="text-surface-900 dark:text-white font-bold">{nextDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-surface-500 font-medium">Completion Date:</span>
                       <span className="text-surface-900 dark:text-white font-bold">
                         {policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-6 pt-0">
                  <Link 
                    to="/file-claim" 
                    state={{ policyId: policy.id, policyName: policy.policyName }}
                    className="w-full btn-ghost border border-surface-200 dark:border-surface-700 text-xs tracking-widest uppercase font-bold !py-3 block text-center hover:bg-surface-900 hover:text-white dark:hover:bg-white dark:hover:text-surface-900"
                  >
                    File a Claim
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
