import API from './axios'

const CLAIMS_BASE = '/claims-service/api/claims'

export const claimService = {
  initiateClaim: (data) =>
    API.post(`${CLAIMS_BASE}/initiate`, data),

  uploadDocument: (claimId, file) => {
    const formData = new FormData()
    formData.append('claimId', claimId)
    formData.append('file', file)
    return API.post(`${CLAIMS_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getClaimStatus: (claimId) =>
    API.get(`${CLAIMS_BASE}/status/${claimId}`),

  getClaimById: (claimId) =>
    API.get(`${CLAIMS_BASE}/${claimId}`),

  getClaimsByUser: (userId) =>
    API.get(`${CLAIMS_BASE}/user/${userId}`),

  downloadDocument: (claimId) =>
    API.get(`${CLAIMS_BASE}/${claimId}/document`, { responseType: 'blob' }),
}
