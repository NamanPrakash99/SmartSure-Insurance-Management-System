import API from './axios'
import { handleRequest } from './apiErrorHandler'

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
  createOrder: (data) =>
    handleRequest(API.post(`${PAYMENT_BASE}/create`, data)),

  /**
   * Verifies an existing payment transaction.
   */
  verifyPayment: (data) =>
    handleRequest(API.post(`${PAYMENT_BASE}/verify`, data)),
}
