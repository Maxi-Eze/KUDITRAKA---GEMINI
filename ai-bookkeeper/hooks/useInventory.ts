'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import { queryKeys } from './keys';

export function useInventoryItems() {
  return useQuery({
    queryKey: queryKeys.inventory.list(),
    queryFn: inventoryApi.list,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => inventoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
  });
}
