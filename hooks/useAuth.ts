'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { queryKeys } from './keys';
import type { User } from '@/lib/types';

export function useUser() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getProfile,
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
      localStorage.setItem('ai-bk-is-logged', 'true');
      qc.setQueryData(queryKeys.auth.user(), res.user);
      router.push('/');
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      router.push('/login');
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
      router.push('/');
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => authApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return () => {
    localStorage.removeItem('ai-bk-token');
    localStorage.removeItem('ai-bk-user');
    localStorage.removeItem('ai-bk-is-logged');
    localStorage.removeItem('ai-bk-onboarded');
    qc.clear();
    router.push('/login');
  };
}
