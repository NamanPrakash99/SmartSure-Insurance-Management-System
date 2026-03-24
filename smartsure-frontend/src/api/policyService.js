import API from './axios'

const POLICY_BASE = '/policy-service/api'

export const policyService = {
  getAllPolicies: () =>
    API.get(`${POLICY_BASE}/policies`),

  getPolicy: (id) =>
    API.get(`${POLICY_BASE}/policies/${id}`),

  getPolicyTypes: () =>
    API.get(`${POLICY_BASE}/policy-types`),

  purchasePolicy: (policyId) =>
    API.post(`${POLICY_BASE}/policies/purchase?policyId=${policyId}`),

  // Admin endpoints
  getUserPolicies: (userId) =>
    API.get(`${POLICY_BASE}/admin/user-policies/${userId}`),

  createPolicy: (data) =>
    API.post(`${POLICY_BASE}/admin/policies`, data),

  updatePolicy: (id, data) =>
    API.put(`${POLICY_BASE}/admin/policies/${id}`, data),

  deletePolicy: (id) =>
    API.delete(`${POLICY_BASE}/admin/policies/${id}`),

  getPolicyStats: () =>
    API.get(`${POLICY_BASE}/admin/policies/stats`),

  cancelPolicy: (id) =>
    API.put(`${POLICY_BASE}/admin/policies/${id}/cancel`),
}
