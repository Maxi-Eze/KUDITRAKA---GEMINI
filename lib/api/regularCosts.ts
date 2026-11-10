import { client } from './client';

export type CostEvery = 'day' | 'week' | 'month' | 'year';

/** What the business pays again and again (rent, shop fee, staff pay...), told once. Owner only. */
export interface RegularCost {
  id: string;
  name: string;
  amount: number;
  every: CostEvery;
  /** The same cost as a monthly amount. */
  per_month: number;
}

export const regularCostsApi = {
  list: () => client.get<RegularCost[]>('/regular-costs'),
  /** Adds one, or replaces the one with the same name. */
  save: (data: { name: string; amount: number; every: CostEvery }) => client.post<RegularCost>('/regular-costs', data),
  remove: (id: string) => client.delete(`/regular-costs/${id}`),
};
