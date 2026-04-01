import API from './axios'
import { handleRequest, ApiResponse } from './apiErrorHandler'
import { User } from '../types'

const AUTH_BASE = '/auth-service/api/auth'

export interface AuthResponse {
  token: string;
  refreshToken: string;
  role: 'ADMIN' | 'CUSTOMER';
  id: string | number;
  name: string;
}

const userCache: Record<string | number, User> = {};

export const authService = {
  // ... rest
  sendOtp: (email: string): Promise<ApiResponse<void>> =>
    handleRequest<void>(API.post(`${AUTH_BASE}/send-otp?email=${encodeURIComponent(email)}`)),

  verifyOtp: (email: string, otp: string): Promise<ApiResponse<void>> =>
    handleRequest<void>(
      API.post(`${AUTH_BASE}/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`)
    ),

  register: (data: any): Promise<ApiResponse<User>> =>
    handleRequest<User>(API.post(`${AUTH_BASE}/register`, data)),

  login: (data: any): Promise<ApiResponse<AuthResponse>> =>
    handleRequest<AuthResponse>(API.post(`${AUTH_BASE}/login`, data)),

  getUserById: async (id: string | number): Promise<ApiResponse<User>> => {
    if (userCache[id]) {
      return { success: true, data: userCache[id], status: 200 };
    }
    const res = await handleRequest<User>(API.get(`${AUTH_BASE}/users/${id}`));
    if (res.success) {
      userCache[id] = res.data;
    }
    return res;
  },

  forgotPassword: (email: string): Promise<ApiResponse<void>> =>
    handleRequest<void>(API.post(`${AUTH_BASE}/forgot-password?email=${encodeURIComponent(email)}`)),

  resetPassword: (data: any): Promise<ApiResponse<void>> =>
    handleRequest<void>(API.post(`${AUTH_BASE}/reset-password`, data)),

  updateProfile: (id: string | number, data: Partial<User>): Promise<ApiResponse<User>> =>
    handleRequest<User>(API.put(`${AUTH_BASE}/users/${id}`, data)),

  logout: (): void => {
    localStorage.removeItem('smartsure-token')
    localStorage.removeItem('smartsure-refresh-token')
    localStorage.removeItem('smartsure-user')
    window.location.href = '/login'
  }
}

