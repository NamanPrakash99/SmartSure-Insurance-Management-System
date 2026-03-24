import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard'
import BrowsePolicies from '../pages/customer/BrowsePolicies'
import PolicyDetails from '../pages/customer/PolicyDetails'
import MyPolicies from '../pages/customer/MyPolicies'
import MyClaims from '../pages/customer/MyClaims'

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard'
import PolicyManagement from '../pages/admin/PolicyManagement'
import ClaimsReview from '../pages/admin/ClaimsReview'
import UserPolicies from '../pages/admin/UserPolicies'
import AdminReports from '../pages/admin/AdminReports'

// Layout & Pages
import DashboardLayout from '../components/layout/DashboardLayout'
import LandingPage from '../pages/LandingPage'
import NotFound from '../pages/NotFound'

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function AppRouter() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
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

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

