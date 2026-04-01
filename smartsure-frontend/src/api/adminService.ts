import API from './axios'
import { handleRequest } from './apiErrorHandler'
import { Claim, Policy, UserPolicy, User, ApiResponse } from '../types'

const ADMIN_BASE = '/admin-service/api/admin'

export const adminService = {
  // ── Claims Management ───────────────────────────────────────────────

  reviewClaim: (id: string | number, data: { status: string; remarks: string }): Promise<ApiResponse<Claim>> =>
    handleRequest<Claim>(API.put(`${ADMIN_BASE}/claims/${id}/review`, data)),

  getClaimStatus: (id: string | number): Promise<ApiResponse<{ status: string }>> =>
    handleRequest<{ status: string }>(API.get(`${ADMIN_BASE}/claims/status/${id}`)),

  getClaimsByUser: (userId: string | number): Promise<ApiResponse<Claim[]>> =>
    handleRequest<Claim[]>(API.get(`${ADMIN_BASE}/claims/user/${userId}`)),

  downloadClaimDocument: (id: string | number): Promise<ApiResponse<Blob>> =>
    handleRequest<Blob>(
      API.get(`${ADMIN_BASE}/claims/${id}/document`, { responseType: 'blob' })
    ),

  getAllClaims: (page: number = 0, size: number = 10): Promise<ApiResponse<Claim[]>> =>
    handleRequest<Claim[]>(API.get(`${ADMIN_BASE}/claims`, { params: { page, size } })),

  updateClaim: (id: string | number, data: Partial<Claim>): Promise<ApiResponse<Claim>> =>
    handleRequest<Claim>(API.put(`${ADMIN_BASE}/claims/${id}`, data)),

  deleteClaim: (id: string | number): Promise<ApiResponse<void>> =>
    handleRequest<void>(API.delete(`${ADMIN_BASE}/claims/${id}`)),

  // ── Policies Oversight ──────────────────────────────────────────────

  createPolicy: (data: Partial<Policy>): Promise<ApiResponse<Policy>> =>
    handleRequest<Policy>(API.post(`${ADMIN_BASE}/policies`, data)),

  updatePolicy: (id: string | number, data: Partial<Policy>): Promise<ApiResponse<Policy>> =>
    handleRequest<Policy>(API.put(`${ADMIN_BASE}/policies/${id}`, data)),

  deletePolicy: (id: string | number): Promise<ApiResponse<void>> =>
    handleRequest<void>(API.delete(`${ADMIN_BASE}/policies/${id}`)),

  getUserPolicies: (userId: string | number): Promise<ApiResponse<UserPolicy[]>> =>
    handleRequest<UserPolicy[]>(API.get(`${ADMIN_BASE}/user-policies/${userId}`)),

  getAllUserPolicies: (): Promise<ApiResponse<UserPolicy[]>> =>
    handleRequest<UserPolicy[]>(API.get(`${ADMIN_BASE}/user-policies/all`)),

  cancelUserPolicy: (id: string | number): Promise<ApiResponse<void>> =>
    handleRequest<void>(API.put(`${ADMIN_BASE}/policies/${id}/cancel`)),

  // ── Reports and Customer Data ───────────────────────────────────────

  getReports: (): Promise<ApiResponse<any>> =>
    handleRequest<any>(API.get(`${ADMIN_BASE}/reports`)),

  getCustomers: (): Promise<ApiResponse<User[]>> =>
    handleRequest<User[]>(API.get(`${ADMIN_BASE}/customers`)),
}

