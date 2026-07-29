'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { customersApi } from '@/lib/api';
import { queryKeys } from './keys';

export function useCustomersList() {
  return useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: customersApi.list,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to create customer'),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof customersApi.update>[1] }) =>
      customersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to update customer'),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to delete customer'),
  });
}
