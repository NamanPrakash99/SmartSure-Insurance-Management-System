import API from './axios'
import { handleRequest } from './apiErrorHandler'

const POLICY_BASE = '/policy-service/api'

/**
 * Policy Service
 * 
 * Manages insurance policies, policy types, and individual user policy actions.
 * Provides both customer-facing and admin endpoints.
 */
export const policyService = {
  // ── Customer Endpoints ──────────────────────────────────────────────

  /**
   * Fetches all available policies.
   */
  getAllPolicies: () =>
    handleRequest(API.get(`${POLICY_BASE}/policies`)),

  /**
   * Fetches details for a specific policy.
   */
  getPolicy: (id) =>
    handleRequest(API.get(`${POLICY_BASE}/policies/${id}`)),

  /**
   * Fetches a list of all insurance policy types.
   */
  getPolicyTypes: () =>
    handleRequest(API.get(`${POLICY_BASE}/policy-types`)),

  /**
   * Purchases a specific policy for the authenticated user.
   */
  purchasePolicy: (policyId) =>
    handleRequest(API.post(`${POLICY_BASE}/policies/purchase?policyId=${policyId}`)),

  /**
   * Renews an existing policy.
   */
  renewPolicy: (id) =>
    handleRequest(API.post(`${POLICY_BASE}/policies/renew/${id}`)),

  /**
   * Deletes a user's specific policy.
   */
  deleteUserPolicy: (id) =>
    handleRequest(API.delete(`${POLICY_BASE}/policies/${id}`)),

  // ── Admin Endpoints ─────────────────────────────────────────────────

  /**
   * Admin: Fetches policies belonging to a specific user.
   */
  getUserPolicies: (userId) =>
    handleRequest(API.get(`${POLICY_BASE}/admin/user-policies/${userId}`)),

  /**
   * Admin: Creates a new policy template.
   */
  createPolicy: (data) =>
    handleRequest(API.post(`${POLICY_BASE}/admin/policies`, data)),

  /**
   * Admin: Updates an existing policy template.
   */
  updatePolicy: (id, data) =>
    handleRequest(API.put(`${POLICY_BASE}/admin/policies/${id}`, data)),

  /**
   * Admin: Deletes a policy template.
   */
  deletePolicy: (id) =>
    handleRequest(API.delete(`${POLICY_BASE}/admin/policies/${id}`)),

  /**
   * Admin: Fetches aggregate statistics for all policies.
   */
  getPolicyStats: () =>
    handleRequest(API.get(`${POLICY_BASE}/admin/policies/stats`)),

  /**
   * Admin: Cancels a specific user policy.
   */
  cancelPolicy: (id) =>
    handleRequest(API.put(`${POLICY_BASE}/admin/policies/${id}/cancel`)),
}
