import API from './axios'
import { handleRequest } from './apiErrorHandler'

const CLAIMS_BASE = '/claims-service/api/claims'

/**
 * Claims Service
 * 
 * Manages filing, monitoring, and validating insurance claims.
 */
export const claimService = {
  /**
   * Initiates a new insurance claim.
   */
  initiateClaim: (data) =>
    handleRequest(API.post(`${CLAIMS_BASE}/initiate`, data)),

  /**
   * Uploads a document related to a specific claim.
   */
  uploadDocument: (claimId, file) => {
    const formData = new FormData()
    formData.append('claimId', claimId)
    formData.append('file', file)
    return handleRequest(
      API.post(`${CLAIMS_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    )
  },

  /**
   * Fetches the current status of a claim.
   */
  getClaimStatus: (claimId) =>
    handleRequest(API.get(`${CLAIMS_BASE}/status/${claimId}`)),

  /**
   * Fetches complete details of a claim by ID.
   */
  getClaimById: (claimId) =>
    handleRequest(API.get(`${CLAIMS_BASE}/${claimId}`)),

  /**
   * Fetches all claims associated with a specific user.
   */
  getClaimsByUser: (userId) =>
    handleRequest(API.get(`${CLAIMS_BASE}/user/${userId}`)),

  /**
   * Downloads a specific claim document (returns a Blob).
   */
  downloadDocument: (claimId) =>
    handleRequest(
      API.get(`${CLAIMS_BASE}/${claimId}/document`, { responseType: 'blob' })
    ),

  /**
   * Deletes an existing claim.
   */
  deleteClaim: (claimId) =>
    handleRequest(API.delete(`${CLAIMS_BASE}/${claimId}`)),
}
