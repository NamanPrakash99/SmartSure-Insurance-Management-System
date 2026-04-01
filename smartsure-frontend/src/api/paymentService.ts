import API from './axios'
import { handleRequest } from './apiErrorHandler'
import { ApiResponse } from '../types'

const PAYMENT_BASE = '/payment-service/payment'

/**
 * Payment Service
 * 
 * Handles transactions and payment verifications.
 */
export const paymentService = {
  /**
   * Creates a new payment order.
   */
  createOrder: (data: any): Promise<ApiResponse<any>> =>
    handleRequest(API.post(`${PAYMENT_BASE}/create`, data)),

  /**
   * Verifies an existing payment transaction.
   */
  verifyPayment: (data: any): Promise<ApiResponse<any>> =>
    handleRequest(API.post(`${PAYMENT_BASE}/verify`, data)),
}
