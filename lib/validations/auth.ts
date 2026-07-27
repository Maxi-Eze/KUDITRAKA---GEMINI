import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    businessName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const onboardingSchema = z.object({
  business_sector: z.string().min(1, 'Select a business sector'),
  inventory_enabled: z.boolean(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().min(1, 'Business name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  cacNumber: z.string().optional(),
  businessType: z.string().optional(),
  businessSize: z.string().optional(),
  salesChannel: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
