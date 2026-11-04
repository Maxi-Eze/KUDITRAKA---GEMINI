import { client } from './client';
import type { CustomerDebts, DebtEntry, DebtsSummary } from '../types';

export const debtsApi = {
  list: (status: 'open' | 'paid' = 'open') => client.get<DebtsSummary>(`/debts?status=${status}`),
  customer: (name: string) => client.get<CustomerDebts>(`/debts/customer?name=${encodeURIComponent(name)}`),
  /** A debt from before Misa, or credit given outside it. Not a new sale. */
  add: (data: { customer_name: string; customer_phone?: string | null; amount: number; item?: string | null }) =>
    client.post<DebtEntry>('/debts', data),
  /** Customer paid back. Lowers what they owe; not a new sale. */
  payment: (data: { customer_name: string; amount: number }) =>
    client.post<{ paid: number; remaining: number; message: string }>('/debts/payment', data),
  remove: (id: string) => client.delete(`/debts/${id}`),
};
