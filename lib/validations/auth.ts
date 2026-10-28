import { z } from 'zod';
import { PHONE_ERROR, toNigerianInternational } from '@/lib/phone';

// Accepts "0803 456 7890", "+234 803 456 7890" etc. Forms convert it with
// toNigerianInternational() before sending, so the backend always gets +234….
export const phoneSchema = z
  .string()
  .trim()
  .max(25, 'Phone number is too long')
  .optional()
  .refine((v) => !v || toNigerianInternational(v) !== null, PHONE_ERROR);

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long'),
    email: z.string().trim().email('Enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),
    confirmPassword: z.string(),
    businessName: z.string().trim().max(120, 'Business name is too long').optional(),
    phone: phoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  businessName: z.string().trim().max(120, 'Business name is too long').optional(),
  phone: phoneSchema,
});

export const onboardingSchema = z.object({
  business_sector: z.string().min(1, 'Select a business sector'),
  inventory_enabled: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
