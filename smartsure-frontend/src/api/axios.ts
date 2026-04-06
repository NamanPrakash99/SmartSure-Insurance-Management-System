import axios from 'axios'
import { API_BASE_URL, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './constants'

/**
 * Premium Axios Instance
 * 
 * Includes:
 * - Environment injection
 * - Automated JWT attach
 * - Smart token refresh logic
 * - Global timeout and headers
 */

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

//  Request Interceptor 
// Automatically injects the Bearer token if it exists in storage.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

//  Response Interceptor 
// Handles global error states (like 401s) and executes silent token refreshes.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If unauthorized and we haven't retried this specific request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (refreshToken) {
        try {
          // Perform a silent refresh using raw axios to avoid interceptor recursion
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth-service/api/auth/refresh-token`, {
            refreshToken: refreshToken
          })

          const { accessToken } = refreshResponse.data
          localStorage.setItem(AUTH_TOKEN_KEY, accessToken)

          // Re-attempt the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return API(originalRequest)
        } catch (refreshError) {
          // Refresh token expired or invalid? Critical failure: force logout.
          handleLogOut()
        }
      } else {
        handleLogOut()
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Cleanly wipes auth state and reroutes to login.
 */
function handleLogOut() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)

  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export default API
