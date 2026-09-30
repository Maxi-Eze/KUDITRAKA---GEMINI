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

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.reports.analytics(),
    queryFn: reportsApi.getAnalytics,
  });
}
