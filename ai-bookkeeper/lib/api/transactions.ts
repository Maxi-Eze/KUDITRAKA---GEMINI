import { client } from './client';
import type { Transaction } from '../types';

export const transactionsApi = {
  list: () => client.get<Transaction[]>('/transactions'),
  create: (data: Omit<Transaction, 'id'>) => client.post<Transaction>('/transactions', data),
  remove: (id: string) => client.delete(`/transactions/${id}`),
};
