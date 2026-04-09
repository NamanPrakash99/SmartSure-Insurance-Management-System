// src/types/index.ts

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  status: number
  headers?: any
}

export interface ApiErrorResponse {
  success: false
  status: number
  message: string
  errors?: any
  code?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string | number;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Policy {
  id: string | number;
  name: string;
  policyName?: string; // Backend variation
  description: string;
  policyDescription?: string; // Backend variation
  premiumAmount?: number;
  premium?: number;
  coverageAmount?: number;
  coverage?: number;
  durationInMonths?: number;
  policyTypeId?: number;
  typeId?: number;
  category?: string;
  type?: string;
}

export interface Claim {
  id: string | number;
  claimId?: string | number;
  policyId: string | number;
  userId: string | number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'CLOSED';
  description: string;
  amount: number;
  claimAmount?: number; // Backend variation
  incidentDate: string;
  claimDate: string;
  documentUrl?: string;
  remarks?: string;
  remark?: string;
}

export interface UserPolicy {
  id: string | number;
  userId: string | number;
  policyId: string | number;
  startDate: string;
  endDate: string;
  premiumAmount?: number;
  coverageAmount?: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_PAYMENT';
  policy?: Policy;
  nextPaymentDueDate?: string;
}
