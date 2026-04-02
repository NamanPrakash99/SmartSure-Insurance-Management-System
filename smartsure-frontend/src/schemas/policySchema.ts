import { z } from 'zod'

export const policySchema = z.object({
  name: z.string()
    .min(3, 'Policy name must be at least 3 characters')
    .regex(/^[A-Za-z\s]+$/, 'Policy name must contain only alphabets'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  policyTypeId: z.string().min(1, 'Please select a policy type'),
  premiumAmount: z.string()
    .min(1, 'Premium is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Premium must be a positive number',
    }),
  coverageAmount: z.string()
    .min(1, 'Coverage is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1000, {
      message: 'Coverage must be at least ₹1,000',
    }),
  durationInMonths: z.string()
    .min(1, 'Duration is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
      message: 'Duration must be at least 1 month',
    }),
})

export type PolicyInput = z.infer<typeof policySchema>
