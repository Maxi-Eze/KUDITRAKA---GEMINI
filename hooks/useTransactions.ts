'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { transactionsApi } from '@/lib/api';
import { queryKeys } from './keys';

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: () => transactionsApi.list(),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transactions.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to create transaction'),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof transactionsApi.update>[1] }) =>
      transactionsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transactions.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to update transaction'),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transactions.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to delete transaction'),
  });
}
