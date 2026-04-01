import API from './axios'
import { handleRequest } from './apiErrorHandler'
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './constants'

const AUTH_BASE = '/auth-service/api/auth'

/**
 * Authentication Service
 * 
 * Provides industry-standard wrappers for authentication-related API calls.
 * All methods return a normalized response shape: { success, data, status, message, errors }.
 */
export const authService = {
  /**
   * Sends an OTP to the provided email.
   */
  sendOtp: (email) =>
    handleRequest(API.post(`${AUTH_BASE}/send-otp?email=${encodeURIComponent(email)}`)),

  /**
   * Verifies the OTP sent to the email.
   */
  verifyOtp: (email, otp) =>
    handleRequest(
      API.post(`${AUTH_BASE}/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
    ),

  /**
   * Registers a new user.
   */
  register: (data) =>
    handleRequest(API.post(`${AUTH_BASE}/register`, data)),

  /**
   * Logs in a user.
   */
  login: (data) =>
    handleRequest(API.post(`${AUTH_BASE}/login`, data)),

  /**
   * Fetches user details by ID.
   */
  getUserById: (id) =>
    handleRequest(API.get(`${AUTH_BASE}/users/${id}`)),

  /**
   * Initiates the forgot password flow.
   */
  forgotPassword: (email) =>
    handleRequest(API.post(`${AUTH_BASE}/forgot-password?email=${encodeURIComponent(email)}`)),

  /**
   * Resets the password using a token.
   */
  resetPassword: (data) =>
    handleRequest(API.post(`${AUTH_BASE}/reset-password`, data)),

  /**
   * Updates user profile details.
   */
  updateProfile: (id, data) =>
    handleRequest(API.put(`${AUTH_BASE}/users/${id}`, data)),

  /**
   * Logs out the user by clearing local storage and redirects to login.
   */
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    window.location.href = '/login'
  }
}
