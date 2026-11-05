import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(4, 'Password must be at least 4 characters')
});

export const CheckInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive(),
  deviceTimestamp: z.string().datetime().optional()
});

export const CheckOutSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive(),
  deviceTimestamp: z.string().datetime().optional(),
  remarks: z.string().max(500).optional()
});

export const CreateEntrySchema = z.object({
  websiteUrl: z.string().url('Must be a valid URL'),
  bankAccountNumber: z.string().min(6, 'Bank account must be at least 6 digits'),
  referenceId: z.string().min(2, 'Reference ID is required'),
  amount: z.number().positive('Amount must be positive'),
  withdrawalAmount: z.number().nonnegative('Withdrawal cannot be negative'),
  screenshotDataUrl: z.string().min(10, 'Screenshot data is required')
});
