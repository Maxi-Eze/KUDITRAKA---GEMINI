import { client } from './client';
import type { Customer } from '@/lib/types';

export const customersApi = {
  list: () => client.get<Customer[]>('/customers'),
  get: (id: string) => client.get<Customer>(`/customers/${id}`),
  create: (data: { name: string; phone?: string; email?: string }) =>
    client.post<Customer>('/customers', data),
  update: (id: string, data: { name?: string; phone?: string; email?: string }) =>
    client.put<Customer>(`/customers/${id}`, data),
  remove: (id: string) => client.delete(`/customers/${id}`),
  findOrCreate: async (name: string) => {
    const customers = await client.get<Customer[]>('/customers');
    const existing = customers.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;
    return client.post<Customer>('/customers', { name });
  },
};
