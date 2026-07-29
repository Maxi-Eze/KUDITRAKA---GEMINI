import { client } from './client';
import type { InventoryItem, ReconciliationLog } from '@/lib/types';

export const inventoryApi = {
  list: () => client.get<InventoryItem[]>('/inventory'),
  create: (data: Partial<InventoryItem>) => client.post<InventoryItem>('/inventory', data),
  update: (id: string, data: Partial<InventoryItem>) => client.patch<InventoryItem>(`/inventory/${id}`, data),
  remove: (id: string) => client.delete(`/inventory/${id}`),
  reconcile: (id: string, data: { actual_stock: number; reason: string }) =>
    client.post<{ item: InventoryItem; log: ReconciliationLog }>(`/inventory/${id}/reconcile`, data),
  adjustStock: (id: string, data: { quantity: number }) =>
    client.patch<InventoryItem>(`/inventory/${id}/stock`, data),
  getLogs: () => client.get<ReconciliationLog[]>('/inventory/logs'),
};
