import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
});

export const updatePatientProfileSchema = z.object({
  dateOfBirth: z.string().optional(),
  bloodType: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
});

export const updateDoctorProfileSchema = z.object({
  specialty: z.string().min(2).optional(),
  licenseNumber: z.string().min(2).optional(),
  hospitalId: z.string().optional(),
  workingHours: z.any().optional(),
});

export const updateNurseProfileSchema = z.object({
  assignedZone: z.string().optional().nullable(),
});
