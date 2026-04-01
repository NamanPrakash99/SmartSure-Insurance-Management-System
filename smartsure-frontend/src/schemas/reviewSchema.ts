import { z } from 'zod'

export const reviewSchema = z.object({
  remarks: z.string().min(5, 'Remarks must be at least 5 characters'),
  status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED']),
})

export type ReviewInput = z.infer<typeof reviewSchema>

export const claimEditSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export type ClaimEditInput = z.infer<typeof claimEditSchema>
