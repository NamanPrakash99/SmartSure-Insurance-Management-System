import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8888',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartsure-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('smartsure-refresh-token')

      if (refreshToken) {
        try {
          // Note: Using raw axios here to avoid interceptor loop
          const response = await axios.post('http://localhost:8888/auth-service/api/auth/refresh-token', {
             refreshToken: refreshToken
          })

          const { accessToken } = response.data
          localStorage.setItem('smartsure-token', accessToken)
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return API(originalRequest)
        } catch (refreshError) {
          // If refresh token also fails, clear and logout
          localStorage.removeItem('smartsure-token')
          localStorage.removeItem('smartsure-user')
          localStorage.removeItem('smartsure-refresh-token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default API
