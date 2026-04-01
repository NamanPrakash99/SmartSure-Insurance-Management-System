import API from './axios'
import { handleRequest } from './apiErrorHandler'

const ADMIN_BASE = '/admin-service/api/admin'

/**
 * Admin Service
 * 
 * Provides administrative oversight for the entire SmartSure system, 
 * including claims management, policy creation, reporting, and customer oversight.
 */
export const adminService = {
  // ── Claims Management ───────────────────────────────────────────────

  /**
   * Reviews a specific claim and updates its approval status.
   */
  reviewClaim: (id, data) =>
    handleRequest(API.put(`${ADMIN_BASE}/claims/${id}/review`, data)),

  /**
   * Fetches the current processing status of a claim.
   */
  getClaimStatus: (id) =>
    handleRequest(API.get(`${ADMIN_BASE}/claims/status/${id}`)),

  /**
   * Fetches all claims associated with a given user ID.
   */
  getClaimsByUser: (userId) =>
    handleRequest(API.get(`${ADMIN_BASE}/claims/user/${userId}`)),

  /**
   * Downloads the raw document file for a claim.
   */
  downloadClaimDocument: (id) =>
    handleRequest(
      API.get(`${ADMIN_BASE}/claims/${id}/document`, { responseType: 'blob' })
    ),

  /**
   * Fetches a paginated list of all claims across the system.
   */
  getAllClaims: (page = 0, size = 10) =>
    handleRequest(API.get(`${ADMIN_BASE}/claims`, { params: { page, size } })),

  /**
   * Updates an existing claim's data.
   */
  updateClaim: (id, data) =>
    handleRequest(API.put(`${ADMIN_BASE}/claims/${id}`, data)),

  /**
   * Permanently deletes a claim entry.
   */
  deleteClaim: (id) =>
    handleRequest(API.delete(`${ADMIN_BASE}/claims/${id}`)),

  // ── Policies Oversight ──────────────────────────────────────────────

  /**
   * Creates a new policy template.
   */
  createPolicy: (data) =>
    handleRequest(API.post(`${ADMIN_BASE}/policies`, data)),

  /**
   * Updates an existing policy template.
   */
  updatePolicy: (id, data) =>
    handleRequest(API.put(`${ADMIN_BASE}/policies/${id}`, data)),

  /**
   * Deletes a policy template from the catalogue.
   */
  deletePolicy: (id) =>
    handleRequest(API.delete(`${ADMIN_BASE}/policies/${id}`)),

  /**
   * Fetches all active policies held by a specific user.
   */
  getUserPolicies: (userId) =>
    handleRequest(API.get(`${ADMIN_BASE}/user-policies/${userId}`)),

  /**
   * Fetches all registered user policies in the system.
   */
  getAllUserPolicies: () =>
    handleRequest(API.get(`${ADMIN_BASE}/user-policies/all`)),

  /**
   * Forces the cancellation of a user's active policy.
   */
  cancelUserPolicy: (id) =>
    handleRequest(API.put(`${ADMIN_BASE}/policies/${id}/cancel`)),

  // ── Reports and Customer Data ───────────────────────────────────────

  /**
   * Fetches aggregate system reports and performance data.
   */
  getReports: () =>
    handleRequest(API.get(`${ADMIN_BASE}/reports`)),

  /**
   * Fetches a list of all registered customers.
   */
  getCustomers: () =>
    handleRequest(API.get(`${ADMIN_BASE}/customers`)),
}
