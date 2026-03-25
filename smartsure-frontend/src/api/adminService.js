import API from './axios'

const ADMIN_BASE = '/admin-service/api/admin'

export const adminService = {
  // Claims
  reviewClaim: (id, data) =>
    API.put(`${ADMIN_BASE}/claims/${id}/review`, data),

  getClaimStatus: (id) =>
    API.get(`${ADMIN_BASE}/claims/status/${id}`),

  getClaimsByUser: (userId) =>
    API.get(`${ADMIN_BASE}/claims/user/${userId}`),

  downloadClaimDocument: (id) =>
    API.get(`${ADMIN_BASE}/claims/${id}/document`, { responseType: 'blob' }),

  getAllClaims: (page = 0, size = 10) =>
    API.get(`${ADMIN_BASE}/claims`, { params: { page, size } }),
  updateClaim: (id, data) => API.put(`${ADMIN_BASE}/claims/${id}`, data),
  deleteClaim: (id) => API.delete(`${ADMIN_BASE}/claims/${id}`),



  // Policies
  createPolicy: (data) =>
    API.post(`${ADMIN_BASE}/policies`, data),

  updatePolicy: (id, data) =>
    API.put(`${ADMIN_BASE}/policies/${id}`, data),

  deletePolicy: (id) =>
    API.delete(`${ADMIN_BASE}/policies/${id}`),

  getUserPolicies: (userId) =>
    API.get(`${ADMIN_BASE}/user-policies/${userId}`),

  getAllUserPolicies: () =>
    API.get(`${ADMIN_BASE}/user-policies/all`),

  cancelUserPolicy: (id) =>

    API.put(`${ADMIN_BASE}/policies/${id}/cancel`),

  // Reports

  getReports: () =>
    API.get(`${ADMIN_BASE}/reports`),
}
