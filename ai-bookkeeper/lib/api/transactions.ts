import { client } from './client';
import type { Transaction } from '../types';

interface TransactionQueryParams {
  type?: string;
  startDate?: string;
  endDate?: string;
}

export const transactionsApi = {
  list: (params?: TransactionQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return client.get<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
  },
  get: (id: string) => client.get<Transaction>(`/transactions/${id}`),
  create: (data: Omit<Transaction, 'id'>) => client.post<Transaction>('/transactions', data),
  update: (id: string, data: Partial<Transaction>) =>
    client.put<Transaction>(`/transactions/${id}`, data),
  remove: (id: string) => client.delete(`/transactions/${id}`),
};
