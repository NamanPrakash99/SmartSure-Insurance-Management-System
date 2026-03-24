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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartsure-token')
      localStorage.removeItem('smartsure-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API
