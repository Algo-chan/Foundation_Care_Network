import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['PATIENT', 'NURSE', 'DOCTOR', 'RURAL_HO', 'ADMIN'])
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
});
