import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { policyService } from '../../api/policyService'
import { claimService } from '../../api/claimService'
import { StatsCard } from '../../components/common/StatsCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { StatsSkeleton } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineCurrencyRupee } from 'react-icons/hi'
import { Link } from 'react-router-dom'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState([])
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes, claimsRes] = await Promise.all([
          policyService.getUserPolicies(user.id).catch(() => ({ data: [] })),
          claimService.getClaimsByUser(user.id).catch(() => ({ data: [] }))
        ])
        
        setPolicies(policiesRes.data)
        setClaims(claimsRes.data)
      } catch (error) {
        console.error("Dashboard fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.id])

  const activePolicies = policies.filter(p => p.status === 'ACTIVE').length
  const pendingClaims = claims.filter(c => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status)).length

  return (
    <div className="space-y-8 pb-8">
      {/* Personalized Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-widest">
            {getGreeting()}
          </p>
          <h1 className="section-title text-3xl sm:text-4xl">
            Welcome back, <span className="gradient-text">{user.name || 'User'}</span>
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2 text-sm">
            Here's a quick overview of your insurance portfolio.
          </p>
        </div>
        <Link to="/policies" className="btn-primary text-sm hidden sm:inline-flex items-center gap-2 shrink-0">
          <HiOutlineShieldCheck className="text-lg" />
          Explore New Policies
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
          </>
        ) : (
          <>
            <StatsCard 
              title="Active Policies" 
              value={activePolicies} 
              icon={HiOutlineShieldCheck}
              color="green"
            />
            <StatsCard 
              title="Pending Claims" 
              value={pendingClaims} 
              icon={HiOutlineDocumentText}
              color="amber"
            />
            <StatsCard 
              title="Total Claims Filed" 
              value={claims.length} 
              icon={HiOutlineCurrencyRupee}
              color="blue"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Policies */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-surface-200/80 dark:border-surface-700/60 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50 rounded-t-2xl">
            <h2 className="text-base font-bold tracking-tight">Recent Policies</h2>
            <Link to="/my-policies" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline uppercase tracking-wider">View All</Link>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
              </div>
            ) : policies.length === 0 ? (
              <EmptyState 
                title="No policies yet" 
                description="Start by exploring available insurance plans." 
                icon={HiOutlineShieldCheck}
                actionLabel="Browse Policies"
                actionTo="/policies"
              />
            ) : (
              <div className="divide-y divide-surface-100 dark:divide-surface-800/60">
                {policies.slice(0, 5).map(policy => (
                  <div key={policy.id} className="p-4 sm:px-5 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors flex justify-between items-center">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-semibold text-sm text-surface-900 dark:text-white truncate">{policy.policyName}</p>
                      <p className="text-[11px] text-surface-500 mt-0.5">Start: {policy.startDate || 'N/A'}</p>
                    </div>
                    <StatusBadge status={policy.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Claims */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-surface-200/80 dark:border-surface-700/60 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50 rounded-t-2xl">
            <h2 className="text-base font-bold tracking-tight">Recent Claims</h2>
            <Link to="/my-claims" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline uppercase tracking-wider">View All</Link>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
              </div>
            ) : claims.length === 0 ? (
              <EmptyState 
                title="No claims filed" 
                description="When you file a claim, it will appear here." 
                icon={HiOutlineDocumentText}
                actionLabel="File a Claim"
                actionTo="/file-claim"
              />
            ) : (
              <div className="divide-y divide-surface-100 dark:divide-surface-800/60">
                {claims.slice(0, 5).map(claim => (
                  <div key={claim.claimId} className="p-4 sm:px-5 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors flex justify-between items-center">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-semibold text-sm text-surface-900 dark:text-white flex items-center gap-2">
                        Claim {claim.claimId}
                        {claim.claimAmount && <span className="text-xs font-medium text-surface-500">₹{claim.claimAmount.toLocaleString()}</span>}
                      </p>
                      <p className="text-[11px] text-surface-500 mt-0.5 truncate max-w-[200px]">{claim.description || claim.message}</p>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
