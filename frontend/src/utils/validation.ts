import { z } from 'zod'

// ─── Reusable field schemas ───────────────────────────────────────────────────

const safeString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Max ${max} characters`)
    .refine((v) => !/<script/i.test(v), 'Invalid characters detected')
    .refine((v) => !/javascript:/i.test(v), 'Invalid characters detected')

const bdPhoneNumber = z
  .string()
  .trim()
  .regex(/^(\+880|880|0)?1[3-9]\d{8}$/, 'Enter a valid Bangladeshi number')

const transactionId = z
  .string()
  .trim()
  .min(4, 'Transaction ID too short')
  .max(30, 'Transaction ID too long')
  .regex(/^[A-Za-z0-9]+$/, 'Transaction ID must be alphanumeric only')

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Minimum 3 characters')
  .max(30, 'Maximum 30 characters')
  .regex(/^[a-z0-9_-]+$/, 'Only lowercase letters, numbers, _ and - allowed')
  .refine((v) => !v.startsWith('-') && !v.startsWith('_'), 'Cannot start with - or _')

export const pageSchema = z.object({
  title:   safeString(60).min(2, 'Title must be at least 2 characters'),
  bio:     safeString(300).optional(),
  theme:   z.enum(['noor', 'zafran', 'layla', 'sabz', 'qamar', 'fajr']),
})

export const paymentMethodSchema = z.object({
  provider:    z.enum(['bkash', 'nagad', 'rocket', 'bank']),
  number:      bdPhoneNumber,
  account_name: safeString(50).min(2, 'Account name required'),
})

export const ledgerEntrySchema = z.object({
  senderName:    safeString(60).min(2, 'Name required'),
  senderNote:    safeString(200).optional(),
  amount:        z.number().int().min(1, 'Amount must be at least ৳1').max(100000, 'Amount too large'),
  provider:      z.enum(['bkash', 'nagad', 'rocket', 'bank']),
  transactionId: transactionId.optional(),
})

export const subscriptionSchema = z.object({
  tier:          z.enum(['monthly', 'lifetime']),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket']),
  paymentNumber: bdPhoneNumber,
  transactionId: transactionId,
})

export const profileSchema = z.object({
  displayName: safeString(60).min(2, 'Display name required'),
  username:    usernameSchema,
})

// ─── Validation helper ───────────────────────────────────────────────────────

export function validate<T>(schema: z.ZodSchema<T>, data: unknown):
  | { success: true;  data: T }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) return { success: true, data: result.data }

  const errors: Record<string, string> = {}
  result.error.errors.forEach((e) => {
    const key = e.path.join('.') || 'root'
    errors[key] = e.message
  })
  return { success: false, errors }
}
