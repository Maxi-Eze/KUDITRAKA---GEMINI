import { client } from './client';
import type { Transaction } from '../types';

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  category?: string;
}

function buildQuery(params?: TransactionQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.q) searchParams.set('q', params.q);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.category) searchParams.set('category', params.category);
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

const MAX_PAGE_SIZE = 100;
const MAX_PAGES = 20;

export const transactionsApi = {
  list: (params?: TransactionQueryParams) =>
    client.get<Transaction[]>(`/transactions${buildQuery(params)}`),

  listAll: async (params?: Omit<TransactionQueryParams, 'page' | 'limit'>) => {
    const items: Transaction[] = [];
    let page = 1;
    for (let i = 0; i < MAX_PAGES; i++) {
      const res = await client.getWithMeta<Transaction[]>(
        `/transactions${buildQuery({ ...params, page, limit: MAX_PAGE_SIZE })}`,
      );
      if (Array.isArray(res.data)) items.push(...res.data);
      if (!res.pagination?.hasNextPage) break;
      page += 1;
    }
    return items;
  },

  get: (id: string) => client.get<Transaction>(`/transactions/${id}`),
  create: (data: Omit<Transaction, 'id'>) => client.post<Transaction>('/transactions', data),
  update: (id: string, data: Partial<Transaction>) =>
    client.put<Transaction>(`/transactions/${id}`, data),
  remove: (id: string) => client.delete(`/transactions/${id}`),
};
