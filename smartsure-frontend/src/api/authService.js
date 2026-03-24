import API from './axios'

const AUTH_BASE = '/auth-service/api/auth'

export const authService = {
  sendOtp: (email) =>
    API.post(`${AUTH_BASE}/send-otp?email=${encodeURIComponent(email)}`),

  verifyOtp: (email, otp) =>
    API.post(`${AUTH_BASE}/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`),

  register: (data) =>
    API.post(`${AUTH_BASE}/register`, data),

  login: (data) =>
    API.post(`${AUTH_BASE}/login`, data),

  getUserById: (id) =>
    API.get(`${AUTH_BASE}/users/${id}`),
}
