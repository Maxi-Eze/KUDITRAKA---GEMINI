'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { debtsApi } from '@/lib/api/debts';
import { queryKeys } from './keys';

export function useDebts(status: 'open' | 'paid' = 'open') {
  return useQuery({
    queryKey: queryKeys.debts.list(status),
    queryFn: () => debtsApi.list(status),
  });
}

export function useCustomerDebts(name: string | null) {
  return useQuery({
    queryKey: queryKeys.debts.customer(name || ''),
    queryFn: () => debtsApi.customer(name as string),
    enabled: !!name,
  });
}

/** Debts, sales and reports all change together when money moves. */
function useRefreshMoney() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.debts.all });
    qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
    qc.invalidateQueries({ queryKey: queryKeys.reports.all });
  };
}

export function useRecordPayment() {
  const refresh = useRefreshMoney();
  return useMutation({
    mutationFn: debtsApi.payment,
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message || 'Could not record the payment'),
  });
}

export function useAddDebt() {
  const refresh = useRefreshMoney();
  return useMutation({
    mutationFn: debtsApi.add,
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message || 'Could not add the debt'),
  });
}

export function useRemoveDebt() {
  const refresh = useRefreshMoney();
  return useMutation({
    mutationFn: debtsApi.remove,
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message || 'Could not remove it'),
  });
}
