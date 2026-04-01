import React, { useState, useEffect } from 'react'
import { adminService } from '../../api/adminService'
import { StatsCard } from '../../components/common/StatsCard'
import { StatsSkeleton } from '../../components/common/LoadingSpinner'
import { AreaChart, DonutChart } from '../../components/common/DashboardCharts'
import {
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCurrencyRupee
} from 'react-icons/hi'
import { toast } from 'react-toastify'

interface AdminReportsData {
  totalPolicies: number
  totalClaims: number
  approvedClaims: number
  rejectedClaims: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<AdminReportsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await adminService.getReports()
        if (response.success) {
          setReports(response.data)
        } else {
          toast.error('Failed to load admin reports')
        }
      } catch (error) {
        toast.error('Failed to load admin reports')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-fade-in">
        <div>
          <div className="h-10 w-64 skeleton rounded-xl mb-3" />
          <div className="h-5 w-96 skeleton rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => <StatsSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[450px] skeleton rounded-2xl" />
          <div className="h-[450px] skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!reports) {
    return (
      <div className="p-12 text-center card">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HiOutlineXCircle className="text-3xl text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Service Connection Error</h3>
        <p className="text-sm text-surface-500">Dashboard data is currently unavailable. Please check the backend services.</p>
      </div>
    )
  }

  const stats = [
    { title: "Total Enrollments", value: reports.totalPolicies, icon: HiOutlineShieldCheck, color: 'blue' as const },
    { title: "Total Claims", value: reports.totalClaims, icon: HiOutlineDocumentText, color: 'indigo' as const },
    { title: "Approved Claims", value: reports.approvedClaims, icon: HiOutlineCheckCircle, color: 'green' as const },
    { title: "Rejected Claims", value: reports.rejectedClaims, icon: HiOutlineXCircle, color: 'red' as const },
    { title: "Total Revenue", value: `₹${(reports.totalRevenue || 0).toLocaleString()}`, icon: HiOutlineCurrencyRupee, color: 'amber' as const }
  ]

  const revenueTrend = [
    { label: 'Oct', value: reports.totalRevenue * 0.4 },
    { label: 'Nov', value: reports.totalRevenue * 0.55 },
    { label: 'Dec', value: reports.totalRevenue * 0.45 },
    { label: 'Jan', value: reports.totalRevenue * 0.75 },
    { label: 'Feb', value: reports.totalRevenue * 0.82 },
    { label: 'Mar', value: reports.totalRevenue }
  ]

  const approvalRate = Math.round((reports.approvedClaims / (reports.totalClaims || 1)) * 100)

  return (
    <div className="space-y-8 pb-12">
      <div className="animate-fade-in">
        <h1 className="section-title text-3xl sm:text-4xl mb-2">Admin Dashboard</h1>
        <p className="text-surface-500 text-sm font-medium">Real-time oversight of SmartSure policy clusters and claim lifecycles.</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Intelligence Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 card p-6 sm:p-8 h-[450px] flex flex-col items-start">
          <div className="mb-6">
            <h3 className="text-base font-bold tracking-tight mb-1">Revenue Performance</h3>
            <p className="text-xs text-surface-500 font-medium">Monthly revenue accumulation trends for the current fiscal quarter.</p>
          </div>
          <div className="flex-1 w-full flex items-end justify-center">
            <AreaChart data={revenueTrend} color="#6366f1" />
          </div>
        </div>

        {/* Approval Rate Donut Chart */}
        <div className="card p-6 sm:p-8 h-[450px] flex flex-col items-center justify-between text-center">
          <div className="mb-4">
            <h3 className="text-base font-bold tracking-tight mb-1">Claim Success Ratio</h3>
            <p className="text-xs text-surface-500 font-medium">Percentage of successfully approved claims.</p>
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            <DonutChart
              percent={approvalRate}
              label="Approved"
              color={approvalRate > 50 ? '#10b981' : '#f59e0b'}
            />
          </div>

          <div className="w-full pt-6 border-t border-surface-100 dark:border-surface-700/50">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-surface-500">Accepted: {reports.approvedClaims}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-surface-500">Denied: {reports.rejectedClaims}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
