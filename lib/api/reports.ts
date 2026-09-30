import { client } from './client';
import type { Transaction } from '../types';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ReportCount {
  total: number;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category: string;
  type: string;
  total: number;
  count: number;
  percentage: number;
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  total: number;
  count: number;
}

export interface ReportSummary {
  period: ReportPeriod;
  start_date: string;
  end_date: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  profit_margin_percent: number;
  transaction_count: ReportCount;
  average_transaction: {
    income: number;
    expense: number;
  };
  category_breakdown: CategoryBreakdown[];
  payment_method_breakdown: PaymentMethodBreakdown[];
}

export interface DailyReport {
  date: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  transaction_count: ReportCount;
  category_breakdown: CategoryBreakdown[];
  transactions: Transaction[];
}

export interface AnalyticsTimelinePoint {
  period: string;
  income: number;
  expense: number;
  net_profit: number;
  profit_margin_percent: number;
  transaction_count: number;
}

export interface Analytics {
  interval: string;
  timeline: AnalyticsTimelinePoint[];
  overall_summary: {
    total_income: number;
    total_expenses: number;
    net_balance: number;
    profit_margin_percent: number;
    transaction_count: ReportCount;
  };
}

export const reportsApi = {
  getSummary: (period: ReportPeriod = 'daily') =>
    client.get<ReportSummary>(`/reports/summary?period=${period}`),
  getDaily: () => client.get<DailyReport>('/reports/daily'),
  getAnalytics: () => client.get<Analytics>('/reports/analytics'),
};
