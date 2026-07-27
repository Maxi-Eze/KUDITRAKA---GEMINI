'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { queryKeys } from './keys';

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: queryKeys.reports.dailySummary(date),
    queryFn: () => reportsApi.getDailySummary(date),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.reports.analytics(),
    queryFn: reportsApi.getAnalytics,
  });
}
