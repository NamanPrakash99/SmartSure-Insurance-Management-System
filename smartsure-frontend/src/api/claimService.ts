import API from './axios'
import { handleRequest, ApiResponse } from './apiErrorHandler'
import { Claim } from '../types'

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
  initiateClaim: (data: Partial<Claim>): Promise<ApiResponse<Claim>> =>
    handleRequest<Claim>(API.post(`${CLAIMS_BASE}/initiate`, data)),

  /**
   * Uploads a document related to a specific claim.
   */
  uploadDocument: (claimId: string | number, file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData()
    formData.append('claimId', claimId.toString())
    formData.append('file', file)
    return handleRequest<any>(
      API.post(`${CLAIMS_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    )
  },

  /**
   * Fetches the current status of a claim.
   */
  getClaimStatus: (claimId: string | number): Promise<ApiResponse<string>> =>
    handleRequest<string>(API.get(`${CLAIMS_BASE}/status/${claimId}`)),

  /**
   * Fetches complete details of a claim by ID.
   */
  getClaimById: (claimId: string | number): Promise<ApiResponse<Claim>> =>
    handleRequest<Claim>(API.get(`${CLAIMS_BASE}/${claimId}`)),

  /**
   * Fetches all claims associated with a specific user.
   */
  getClaimsByUser: (userId: string | number): Promise<ApiResponse<Claim[]>> =>
    handleRequest<Claim[]>(API.get(`${CLAIMS_BASE}/user/${userId}`)),

  /**
   * Downloads a specific claim document (returns a Blob).
   */
  downloadDocument: (claimId: string | number): Promise<ApiResponse<Blob>> =>
    handleRequest<Blob>(
      API.get(`${CLAIMS_BASE}/${claimId}/document`, { responseType: 'blob' })
    ),

  /**
   * Deletes an existing claim.
   */
  deleteClaim: (claimId: string | number): Promise<ApiResponse<any>> =>
    handleRequest<any>(API.delete(`${CLAIMS_BASE}/${claimId}`)),
}
