import { ReactNode, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

// Layout & Common
import DashboardLayout from '../components/layout/DashboardLayout'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard'
import BrowsePolicies from '../pages/customer/BrowsePolicies'
const PolicyDetails = lazy(() => import('../pages/customer/PolicyDetails'))
const MyPolicies = lazy(() => import('../pages/customer/MyPolicies'))
const MyClaims = lazy(() => import('../pages/customer/MyClaims'))
const FileClaim = lazy(() => import('../pages/customer/FileClaim'))

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard'
import PolicyManagement from '../pages/admin/PolicyManagement'
const ClaimsReview = lazy(() => import('../pages/admin/ClaimsReview'))
const UserPolicies = lazy(() => import('../pages/admin/UserPolicies'))
const AdminReports = lazy(() => import('../pages/admin/AdminReports'))

// Other Pages
import LandingPage from '../pages/LandingPage'
import Profile from '../pages/common/Profile'
const AboutUs = lazy(() => import('../pages/public/AboutUs'))
const ContactUs = lazy(() => import('../pages/public/ContactUs'))
const Terms = lazy(() => import('../pages/public/Terms'))
const NotFound = lazy(() => import('../pages/NotFound'))

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('ADMIN' | 'CUSTOMER')[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function AppRouter() {
  const { loading } = useAuth()

  if (loading) return null

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900"><LoadingSpinner /></div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<DashboardLayout><AboutUs /></DashboardLayout>} />
        <Route path="/contact" element={<DashboardLayout><ContactUs /></DashboardLayout>} />
        <Route path="/terms" element={<DashboardLayout><Terms /></DashboardLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Customer Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DashboardLayout><CustomerDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/policies" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DashboardLayout><BrowsePolicies /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/policies/:id" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DashboardLayout><PolicyDetails /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-policies" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DashboardLayout><MyPolicies /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/my-claims" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DashboardLayout><MyClaims /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/file-claim" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DashboardLayout><FileClaim /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/policies" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout><PolicyManagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/claims" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout><ClaimsReview /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/user-policies" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout><UserPolicies /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout><AdminReports /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Profile (Common) */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout><Profile /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
