import API from './axios'
import { handleRequest } from './apiErrorHandler'
import { Claim, Policy, UserPolicy, User, ApiResponse } from '../types'
import { policyService } from './policyService'

const ADMIN_BASE = '/admin-service/api/admin'

export const adminService = {
  // ── Claims Management ───────────────────────────────────────────────

  reviewClaim: (id: string | number, data: { status: string; remarks: string }): Promise<ApiResponse<Claim>> =>
    handleRequest<Claim>(API.put(`${ADMIN_BASE}/claims/${id}/review`, { status: data.status, remark: data.remarks })),

  getClaimStatus: (id: string | number): Promise<ApiResponse<{ status: string }>> =>
    handleRequest<{ status: string }>(API.get(`${ADMIN_BASE}/claims/status/${id}`)),

  getClaimsByUser: (userId: string | number): Promise<ApiResponse<Claim[]>> =>
    handleRequest<Claim[]>(API.get(`${ADMIN_BASE}/claims/user/${userId}`)),

  downloadClaimDocument: (id: string | number): Promise<ApiResponse<Blob>> =>
    handleRequest<Blob>(
      API.get(`${ADMIN_BASE}/claims/${id}/document`, { responseType: 'blob' })
    ),

  getAllClaims: (page: number = 0, size: number = 10): Promise<ApiResponse<any>> =>
    handleRequest<any>(API.get(`${ADMIN_BASE}/claims`, { params: { page, size } })),

  updateClaim: (id: string | number, data: Partial<Claim>): Promise<ApiResponse<Claim>> =>
    handleRequest<Claim>(API.put(`${ADMIN_BASE}/claims/${id}`, data)),

  deleteClaim: (id: string | number): Promise<ApiResponse<void>> =>
    handleRequest<void>(API.delete(`${ADMIN_BASE}/claims/${id}`)),

  // ── Policies Oversight ──────────────────────────────────────────────

  createPolicy: async (data: Partial<Policy>): Promise<ApiResponse<Policy>> => {
    policyService.clearCache()
    return handleRequest<Policy>(API.post(`${ADMIN_BASE}/policies`, data))
  },

  updatePolicy: async (id: string | number, data: Partial<Policy>): Promise<ApiResponse<Policy>> => {
    policyService.clearCache()
    return handleRequest<Policy>(API.put(`${ADMIN_BASE}/policies/${id}`, data))
  },

  deletePolicy: async (id: string | number): Promise<ApiResponse<void>> => {
    policyService.clearCache()
    return handleRequest<void>(API.delete(`${ADMIN_BASE}/policies/${id}`))
  },

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

