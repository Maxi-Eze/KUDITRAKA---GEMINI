'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { regularCostsApi } from '@/lib/api/regularCosts';
import { queryKeys } from './keys';

/** Owners only. Fails quietly (no retry) when the server doesn't have regular costs yet. */
export function useRegularCosts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.regularCosts.list(),
    queryFn: regularCostsApi.list,
    enabled,
    retry: false,
  });
}

/** Regular costs change profit, so refresh both. */
function useRefresh() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.regularCosts.all });
    qc.invalidateQueries({ queryKey: queryKeys.reports.all });
  };
}

export function useSaveRegularCost() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: regularCostsApi.save,
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message || 'Could not save the cost'),
  });
}

export function useRemoveRegularCost() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: regularCostsApi.remove,
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message || 'Could not remove the cost'),
  });
}
