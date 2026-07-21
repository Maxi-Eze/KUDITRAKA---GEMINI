import { client } from './client';

export const inventoryApi = {
  list: () => client.get('/inventory'),
  create: (data: Record<string, unknown>) => client.post('/inventory', data),
  update: (id: string, data: Record<string, unknown>) => client.patch(`/inventory/${id}`, data),
  remove: (id: string) => client.delete(`/inventory/${id}`),
};
