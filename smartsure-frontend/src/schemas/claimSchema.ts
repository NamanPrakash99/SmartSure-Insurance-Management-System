import { z } from 'zod'

export const claimSchema = z.object({
  policyId: z.string().min(1, 'Please select a policy'),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  file: z.any().optional(),
})

export type ClaimInput = z.infer<typeof claimSchema>
