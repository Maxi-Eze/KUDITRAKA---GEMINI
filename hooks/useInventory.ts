'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '@/lib/api';
import { queryKeys } from './keys';
import type { InventoryItem } from '@/lib/types';

export function useInventoryItems() {
  return useQuery({
    queryKey: queryKeys.inventory.list(),
    queryFn: inventoryApi.list,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InventoryItem>) => inventoryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to create item'),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => inventoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to update item'),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to delete item'),
  });
}

export function useReconcileStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { actual_stock: number; reason: string } }) =>
      inventoryApi.reconcile(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to reconcile stock'),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      inventoryApi.adjustStock(id, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    onError: (error: Error) => toast.error(error.message || 'Failed to adjust stock'),
  });
}

export function useReconciliationLogs(enabled = true) {
  return useQuery({
    queryKey: queryKeys.inventory.logs(),
    queryFn: inventoryApi.getLogs,
    enabled,
  });
}

/** Stock items that look like the same thing. Owner only, so pass `enabled` false for staff. */
export function useDuplicateItems(enabled = true) {
  return useQuery({
    queryKey: queryKeys.inventory.duplicates(),
    queryFn: inventoryApi.duplicates,
    enabled,
  });
}

export function useMergeItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ keepId, mergeIds }: { keepId: string; mergeIds: string[] }) => inventoryApi.merge(keepId, mergeIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't merge these items"),
  });
}

export function useNotDuplicates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemIds: [string, string]) => inventoryApi.notDuplicates(itemIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.duplicates() }),
    onError: (error: Error) => toast.error(error.message || "Couldn't save that"),
  });
}
