import { useState, useEffect } from 'react'
import { adminService } from '../../api/adminService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { BarChart, DonutChart, GaugeChart } from '../../components/common/DashboardCharts'
import {
   HiOutlinePresentationChartBar,
   HiOutlineArrowCircleUp,
   HiOutlineCurrencyRupee,
   HiOutlineShieldCheck
} from 'react-icons/hi'
import { toast } from 'react-toastify'

interface AdminReportsData {
  totalPolicies: number
  totalClaims: number
  approvedClaims: number
  rejectedClaims: number
  totalRevenue: number
}

export default function AdminReports() {
   const [reports, setReports] = useState<AdminReportsData | null>(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      fetchReports()
   }, [])

   const fetchReports = async () => {
      try {
         const response = await adminService.getReports()
         if (response.success) {
            setReports(response.data)
         } else {
            toast.error('Failed to load system analytics')
         }
      } catch (error) {
         toast.error('Failed to load system analytics')
      } finally {
         setLoading(false)
      }
   }

   if (loading) return <LoadingSpinner />
   if (!reports) return null

   const closedClaims = Math.max(0, reports.totalClaims - (reports.approvedClaims + reports.rejectedClaims))

   const claimsVolumeData = [
      { label: 'Total', value: reports.totalClaims, color: '#6366f1' },
      { label: 'Approved', value: reports.approvedClaims, color: '#10b981' },
      { label: 'Rejected', value: reports.rejectedClaims, color: '#ef4444' },
      { label: 'Closed', value: closedClaims, color: '#f59e0b' }
   ]

   const approvalRate = Math.round((reports.approvedClaims / (reports.totalClaims || 1)) * 100)
   const averageRevenue = reports.totalPolicies > 0 ? (reports.totalRevenue / reports.totalPolicies).toFixed(0) : "0"

   return (
      <div className="space-y-8 pb-12">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
            <div>
               <h1 className="section-title text-3xl sm:text-4xl mb-2">Reports & Analytics</h1>
               <p className="text-surface-500 font-medium italic">Comprehensive performance breakdown of the SmartSure insurance ecosystem.</p>
            </div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 border-l-4 border-primary-500">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl">
                     <HiOutlineShieldCheck className="text-2xl" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-surface-500 uppercase">Growth Index</p>
                     <p className="text-2xl font-black">{reports.totalPolicies} Sold</p>
                  </div>
               </div>
            </div>
            <div className="card p-6 border-l-4 border-emerald-500">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                     <HiOutlineCurrencyRupee className="text-2xl" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-surface-500 uppercase">Avg Revenue</p>
                     <p className="text-2xl font-black">₹{Number(averageRevenue).toLocaleString()}</p>
                  </div>
               </div>
            </div>
            <div className="card p-6 border-l-4 border-amber-500">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                     <HiOutlinePresentationChartBar className="text-2xl" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-surface-500 uppercase">Success Rate</p>
                     <p className="text-2xl font-black">{approvalRate}%</p>
                  </div>
               </div>
            </div>
            <div className="card p-6 border-l-4 border-indigo-500">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                     <HiOutlineArrowCircleUp className="text-2xl" />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-surface-500 uppercase">Market Share</p>
                     <p className="text-2xl font-black">Stable</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Claims Volume Breakdown - Bar Chart */}
            <div className="card p-8 group">
               <div className="flex justify-between items-start mb-10">
                  <div>
                     <h3 className="text-xl font-bold tracking-tight mb-1">Claims Volume Breakdown</h3>
                     <p className="text-sm text-surface-500 font-medium">Distribution across different processing states.</p>
                  </div>
                  <HiOutlinePresentationChartBar className="text-3xl text-primary-500/20 group-hover:text-primary-500 transition-colors" />
               </div>
               <div className="h-72">
                  <BarChart data={claimsVolumeData} />
               </div>
            </div>

            {/* Distribution Circle & Revenue Summary */}
            <div className="grid grid-cols-1 gap-8">
               <div className="card p-8 flex flex-col items-center sm:flex-row justify-between gap-8 h-full">
                  <div className="text-center sm:text-left">
                     <h3 className="text-xl font-bold tracking-tight mb-2">Claim Distribution</h3>
                     <p className="text-sm text-surface-500 font-medium mb-6 italic">Visualizing approved vs remaining queue.</p>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                           <div className="w-3 h-3 rounded-full bg-emerald-500" />
                           <span className="text-surface-700 dark:text-surface-300">Approved ({approvalRate}%)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                           <div className="w-3 h-3 rounded-full bg-surface-200" />
                           <span className="text-surface-400">Closed ({100 - approvalRate}%)</span>
                        </div>
                     </div>
                  </div>
                  <DonutChart percent={approvalRate} label="Approved" color="#10b981" />
               </div>

               <div className="card p-8 bg-surface-900 border-none relative overflow-hidden group">
                  {/* Decorative Gradient */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] pointer-events-none" />

                  <div className="relative z-10 text-white">
                     <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <HiOutlineCurrencyRupee className="text-primary-400" />
                        Revenue Intelligence
                     </h3>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Total Revenue Generated</p>
                           <p className="text-3xl font-black text-primary-400">₹{reports.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Total Policies Sold</p>
                           <p className="text-3xl font-black text-white">{reports.totalPolicies}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Approval & Efficiency Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-8 flex flex-col items-center justify-center text-center">
               <h3 className="text-lg font-bold mb-2">System Approval Rate</h3>
               <p className="text-xs text-surface-500 mb-6 italic">Ratio of claims approved against the total volume.</p>
               <GaugeChart percent={approvalRate} color="#10b981" />
               <div className="mt-4 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Excellent Processing Speed
               </div>
            </div>

            <div className="card p-8 flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-10 bg-primary-500 rounded-full" />
                  <h3 className="text-lg font-bold leading-tight">Operational <br /> Efficiency Report</h3>
               </div>
               <div className="space-y-5">
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs font-bold uppercase text-surface-400">
                        <span>Review Speed</span>
                        <span>94%</span>
                     </div>
                     <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-[94%]" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs font-bold uppercase text-surface-400">
                        <span>Data Accuracy</span>
                        <span>98%</span>
                     </div>
                     <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[98%]" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <div className="flex justify-between text-xs font-bold uppercase text-surface-400">
                        <span>User Satisfaction</span>
                        <span>82%</span>
                     </div>
                     <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[82%]" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}
