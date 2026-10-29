'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import type { ProfileUpdateData } from '@/lib/api/auth';

import { queryKeys } from './keys';
import type { StaffRight, StaffRole, User } from '@/lib/types';

function mapUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as string,
    businessName: (raw.business_name as string) || '',
    ownerName: (raw.name as string) || '',
    businessSector: raw.business_sector as User['businessSector'],
    inventoryEnabled: (raw.inventory_enabled as boolean) || false,
    onboarded: (raw.onboarded as boolean) || false,
    email: (raw.email as string) || '',
    phone: raw.phone as string,
    address: raw.address as string,
    cacNumber: raw.cac_number as string,
    businessType: raw.business_type as string,
    businessSize: raw.business_size as string,
    salesChannel: raw.sales_channel as string,
    staff: raw.staff
      ? {
          memberId: (raw.staff as Record<string, string>).member_id,
          name: (raw.staff as Record<string, string>).name,
          role: (raw.staff as Record<string, string>).role as StaffRole,
          rights: ((raw.staff as Record<string, unknown>).rights as StaffRight[]) || [],
        }
      : null,
  };
}

export function useUser() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const raw = (await authApi.getProfile()) as unknown as Record<string, unknown>;
      return mapUser(raw);
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('ai-bk-token'),
    retry: false,
    staleTime: Infinity,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      localStorage.setItem('ai-bk-token', res.token);
      const mapped = mapUser(res.user as unknown as Record<string, unknown>);
      qc.setQueryData(queryKeys.auth.user(), mapped);
      toast.success('Logged in successfully');
      router.replace(mapped.onboarded ? '/dashboard' : '/onboarding');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

/** Staff log in with the phone number and PIN the owner gave them. */
export function useStaffLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.staffLogin,
    onSuccess: async (res) => {
      localStorage.setItem('ai-bk-token', res.token);
      // Load the staff profile (business + role) before opening the app.
      qc.removeQueries({ queryKey: queryKeys.auth.user() });
      const raw = (await authApi.getProfile()) as unknown as Record<string, unknown>;
      qc.setQueryData(queryKeys.auth.user(), mapUser(raw));
      toast.success(`Welcome, ${res.staff.name}`);
      router.replace('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not log in');
    },
  });
}

export function useSignup() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (_data, variables) => {
      // Sign the new user straight in with the details they just typed, so they go on to set up
      // their business. If that fails, the account still exists: fall back to the login page.
      try {
        const res = await authApi.login({ email: variables.email, password: variables.password });
        localStorage.setItem('ai-bk-token', res.token);
        const mapped = mapUser(res.user as unknown as Record<string, unknown>);
        qc.setQueryData(queryKeys.auth.user(), mapped);
        toast.success('Account created!');
        router.replace(mapped.onboarded ? '/dashboard' : '/onboarding');
      } catch {
        toast.success('Account created! Please log in.');
        router.push('/');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Signup failed');
    },
  });
}

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.completeOnboarding,
    onSuccess: (_data, variables) => {
      qc.setQueryData<User | undefined>(queryKeys.auth.user(), (old) =>
        old
          ? {
              ...old,
              onboarded: true,
              businessSector: variables.business_sector as User['businessSector'],
              inventoryEnabled: variables.inventory_enabled,
            }
          : old
      );
      qc.invalidateQueries({ queryKey: queryKeys.auth.user() });
      toast.success('Business profile completed!');
      router.replace('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Onboarding failed');
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateData) => authApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.user() });
      toast.success('Profile updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Update failed');
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return () => {
    localStorage.removeItem('ai-bk-token');
    qc.clear();
    router.push('/');
  };
}
