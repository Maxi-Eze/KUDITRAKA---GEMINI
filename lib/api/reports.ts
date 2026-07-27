import { client } from './client';

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface AnalyticsRow {
  month: string;
  type: string;
  total: string;
}

export const reportsApi = {
  getDailySummary: (date: string) =>
    client.get<DailySummary>(`/reports/daily-summary?date=${date}`),
  getAnalytics: () => client.get<AnalyticsRow[]>('/reports/analytics'),
};
