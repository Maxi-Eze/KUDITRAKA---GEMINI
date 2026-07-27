'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { setCookie, removeCookie } from '@/lib/utils';
import { queryKeys } from './keys';
import type { User } from '@/lib/types';

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
      setCookie('ai-bk-token', res.token);
      const mapped = mapUser(res.user as unknown as Record<string, unknown>);
      qc.setQueryData(queryKeys.auth.user(), mapped);
      toast.success('Logged in successfully');
      if (!mapped.onboarded) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account created! Please log in.');
      router.push('/login');
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.user() });
      toast.success('Business profile completed!');
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Onboarding failed');
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => authApi.updateProfile(data),
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
    removeCookie('ai-bk-token');
    qc.clear();
    router.push('/login');
  };
}
