import { z } from 'zod'

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

//  Registration Validation Schemas 

export const registerStep1Schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export const registerStep2Schema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
})

export const registerStep3Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
})

/**
 * Password Recovery Schemas
 */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * Types inferred from schemas
 */
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterStep1Input = z.infer<typeof registerStep1Schema>
export type RegisterStep2Input = z.infer<typeof registerStep2Schema>
export type RegisterStep3Input = z.infer<typeof registerStep3Schema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
