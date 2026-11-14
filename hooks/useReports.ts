'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, type ProfitPeriod, type ReportPeriod } from '@/lib/api/reports';
import { queryKeys } from './keys';

export function useSummary(period: ReportPeriod = 'daily') {
  return useQuery({
    queryKey: queryKeys.reports.summary(period),
    queryFn: () => reportsApi.getSummary(period),
  });
}

export function useDailyReport() {
  return useQuery({
    queryKey: queryKeys.reports.daily(),
    queryFn: reportsApi.getDaily,
  });
}

/** Last week's check-up. Fails quietly (no retry) when the server doesn't have it yet or the person can't see reports. */
export function useWeeklyCheckup() {
  return useQuery({
    queryKey: queryKeys.reports.weeklyCheckup(),
    queryFn: reportsApi.getWeeklyCheckup,
    retry: false,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Real profit (sales minus what those goods cost). Owners only: pass enabled=false for staff.
 * Fails quietly (no retry) when the server doesn't have it yet, so callers fall back to money in − out.
 */
export function useProfit(period: ProfitPeriod, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.profit(period),
    queryFn: () => reportsApi.getProfit(period),
    enabled,
    retry: false,
  });
}

/** Things to check (owners only). Fails quietly when the server doesn't have it yet. */
export function useShopAlerts() {
  return useQuery({
    queryKey: queryKeys.reports.alerts(),
    queryFn: reportsApi.getAlerts,
    retry: false,
  });
}

/** "From your staff" (owners only). Fails quietly when the server doesn't have it yet. */
export function useStaffChecks() {
  return useQuery({
    queryKey: queryKeys.reports.staffChecks(),
    queryFn: reportsApi.getStaffChecks,
    retry: false,
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.reports.analytics(),
    queryFn: reportsApi.getAnalytics,
  });
}
