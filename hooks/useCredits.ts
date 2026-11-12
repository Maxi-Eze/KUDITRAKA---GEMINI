'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { creditsApi } from '@/lib/api/credits';
import { useUser } from './useAuth';
import { isOwner } from '@/lib/permissions';
import { queryKeys } from './keys';

/**
 * Credits hooks. Owners only: staff never call these (the server blocks them too).
 * Every query fails quietly (retry: false) so a server without credits yet just hides the parts.
 */

export function useCreditPricing() {
  const { data: user } = useUser();
  return useQuery({
    queryKey: queryKeys.credits.pricing(),
    queryFn: creditsApi.pricing,
    enabled: isOwner(user),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/** True only once charging is switched on (before that, credits stay out of sight). */
export function useCreditsActive() {
  const { data } = useCreditPricing();
  return data?.mode === 'active';
}

export function useCreditBalance(enabled = true) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: queryKeys.credits.balance(),
    queryFn: creditsApi.balance,
    enabled: enabled && isOwner(user),
    retry: false,
  });
}

export function useCreditUsage(days: number) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: queryKeys.credits.usage(days),
    queryFn: () => creditsApi.usage(days),
    enabled: isOwner(user),
    retry: false,
  });
}

export function useTopUpQuote(credits: number) {
  return useQuery({
    queryKey: queryKeys.credits.quote(credits),
    queryFn: () => creditsApi.quote(credits),
    enabled: credits >= 100,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useStartTopUp() {
  return useMutation({
    mutationFn: creditsApi.startTopUp,
    onError: (error: Error) => toast.error(error.message || 'Could not get a bank account. Please try again.'),
  });
}

/** Refresh balances after a payment lands. */
export function useRefreshCredits() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: queryKeys.credits.all });
}

/** Kuditraka staff only: the server answers 403 for everyone else, so this stays false for them. */
export function useIsCreditsAdmin() {
  const { data: user } = useUser();
  const q = useQuery({
    queryKey: queryKeys.credits.admin(),
    queryFn: creditsApi.adminCheck,
    enabled: isOwner(user),
    retry: false,
    staleTime: 30 * 60 * 1000,
  });
  return q.isSuccess;
}

export function useAdminBusinesses(search: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.credits.adminBusinesses(search),
    queryFn: () => creditsApi.adminBusinesses(search),
    enabled,
    retry: false,
  });
}

export function useGiveCredits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { businessId: string; amount: number; reason: string; notify: boolean }) =>
      creditsApi.adminGive(v.businessId, { amount: v.amount, reason: v.reason, notify: v.notify }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.credits.all }),
    onError: (error: Error) => toast.error(error.message || 'Could not give the credits'),
  });
}
