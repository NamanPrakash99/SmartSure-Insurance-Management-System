import API from './axios'

const PAYMENT_BASE = '/payment-service/payment'

export const paymentService = {
  createOrder: (data) =>
    API.post(`${PAYMENT_BASE}/create`, data),

  verifyPayment: (data) =>
    API.post(`${PAYMENT_BASE}/verify`, data),
}
