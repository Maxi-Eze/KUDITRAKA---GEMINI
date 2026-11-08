'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, type ReportPeriod } from '@/lib/api/reports';
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

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.reports.analytics(),
    queryFn: reportsApi.getAnalytics,
  });
}
