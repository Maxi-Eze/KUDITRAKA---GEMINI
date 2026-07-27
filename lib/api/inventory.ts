import { client } from './client';
import type { InventoryItem } from '@/lib/types';

export const inventoryApi = {
  list: () => client.get<InventoryItem[]>('/inventory'),
  create: (data: Partial<InventoryItem>) => client.post<InventoryItem>('/inventory', data),
  update: (id: string, data: Partial<InventoryItem>) => client.patch<InventoryItem>(`/inventory/${id}`, data),
  remove: (id: string) => client.delete(`/inventory/${id}`),
};
