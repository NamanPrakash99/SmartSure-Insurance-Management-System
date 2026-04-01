import API from './axios'
import { handleRequest } from './apiErrorHandler'
import { Policy, UserPolicy, ApiResponse } from '../types'

const POLICY_BASE = '/policy-service/api'

/**
 * Policy Service
 * 
 * Manages insurance policies, policy types, and individual user policy actions.
 * Provides both customer-facing and admin endpoints.
 */
const policyCache: {
  all: Policy[] | null;
  types: any[] | null;
} = {
  all: null,
  types: null
};

export const policyService = {
  clearCache: () => {
    policyCache.all = null;
    policyCache.types = null;
  },

  // ── Customer Endpoints ──────────────────────────────────────────────

  /**
   * Fetches all available policies.
   */
  getAllPolicies: async (): Promise<ApiResponse<Policy[]>> => {
    if (policyCache.all) {
      return { success: true, data: policyCache.all, status: 200 };
    }
    const res = await handleRequest<Policy[]>(API.get(`${POLICY_BASE}/policies`));
    if (res.success) {
      policyCache.all = res.data;
    }
    return res;
  },

  /**
   * Fetches details for a specific policy.
   */
  getPolicy: (id: string | number): Promise<ApiResponse<Policy>> =>
    handleRequest(API.get(`${POLICY_BASE}/policies/${id}`)),

  /**
   * Fetches a list of all insurance policy types.
   */
  getPolicyTypes: async (): Promise<ApiResponse<any[]>> => {
    if (policyCache.types) {
      return { success: true, data: policyCache.types, status: 200 };
    }
    const res = await handleRequest<any[]>(API.get(`${POLICY_BASE}/policy-types`));
    if (res.success) {
      policyCache.types = res.data;
    }
    return res;
  },

  /**
   * Purchases a specific policy for the authenticated user.
   */
  purchasePolicy: (policyId: string | number): Promise<ApiResponse<UserPolicy>> =>
    handleRequest(API.post(`${POLICY_BASE}/policies/purchase?policyId=${policyId}`)),

  /**
   * Renews an existing policy.
   */
  renewPolicy: (id: string | number): Promise<ApiResponse<UserPolicy>> =>
    handleRequest(API.post(`${POLICY_BASE}/policies/renew/${id}`)),

  /**
   * Deletes a user's specific policy.
   */
  deleteUserPolicy: (id: string | number): Promise<ApiResponse<any>> =>
    handleRequest(API.delete(`${POLICY_BASE}/policies/${id}`)),

  // ── Admin Endpoints ─────────────────────────────────────────────────

  /**
   * Admin: Fetches policies belonging to a specific user.
   */
  getUserPolicies: (userId: string | number): Promise<ApiResponse<UserPolicy[]>> =>
    handleRequest(API.get(`${POLICY_BASE}/admin/user-policies/${userId}`)),

  /**
   * Admin: Creates a new policy template.
   */
  createPolicy: (data: Partial<Policy>): Promise<ApiResponse<Policy>> =>
    handleRequest(API.post(`${POLICY_BASE}/admin/policies`, data)),

  /**
   * Admin: Updates an existing policy template.
   */
  updatePolicy: (id: string | number, data: Partial<Policy>): Promise<ApiResponse<Policy>> =>
    handleRequest(API.put(`${POLICY_BASE}/admin/policies/${id}`, data)),

  /**
   * Admin: Deletes a policy template.
   */
  deletePolicy: (id: string | number): Promise<ApiResponse<any>> =>
    handleRequest(API.delete(`${POLICY_BASE}/admin/policies/${id}`)),

  /**
   * Admin: Fetches aggregate statistics for all policies.
   */
  getPolicyStats: (): Promise<ApiResponse<any>> =>
    handleRequest(API.get(`${POLICY_BASE}/admin/policies/stats`)),

  /**
   * Admin: Cancels a specific user policy.
   */
  cancelPolicy: (id: string | number): Promise<ApiResponse<UserPolicy>> =>
    handleRequest(API.put(`${POLICY_BASE}/admin/policies/${id}/cancel`)),
}
