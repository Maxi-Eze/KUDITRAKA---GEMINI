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

/** Last week (Mon–Sun) vs the week before: the same numbers as Misa's Monday WhatsApp check-up. */
export interface WeeklyCheckup {
  hasActivity: boolean;
  text: string | null;
  week: {
    start_date: string;
    end_date: string;
    sales: number;
    spent: number;
    sales_minus_spending: number;
    sales_before: number;
    spent_before: number;
    sales_change_pct: number | null;
    spent_change_pct: number | null;
    records: number;
    top_item: { name: string; quantity: number } | null;
    best_day: { date: string; weekday: string; sales: number } | null;
    owed_total: number;
    debtor_count: number;
    late_count: number;
    running_low: string[];
    tip: string | null;
  };
}

export interface LoanProgressData {
  active_months: number;
  active_months_needed: number;
  active_days_needed: number;
  days_this_month: number;
  months: { month: string; days: number; active: boolean }[];
}

export type ProfitPeriod = 'this_week' | 'this_month' | 'last_month';

export interface ItemProfit {
  item: string;
  quantity: number;
  sales: number;
  cost: number;
  profit: number;
  margin_percent: number;
}

/** Profit on goods: sales minus what those goods cost (owner only). */
export interface ProfitReport {
  label?: string;
  total_sales: number;
  goods_sales: number;
  other_income: number;
  sales_with_cost: number;
  cost_of_goods_sold: number;
  profit_on_goods: number;
  margin_percent: number;
  /** Share of goods sales whose cost is known (0-100). */
  cost_coverage_percent: number;
  no_cost_price: { sales: number; items: string[] };
  cost_unclear: { sales: number; items: string[] };
  stock_bought: number;
  running_costs: number;
  running_costs_recorded: boolean;
  profit_after_running_costs: number;
  items: ItemProfit[];
  losing_items: ItemProfit[];
}

export const reportsApi = {
  getSummary: (period: ReportPeriod = 'daily') =>
    client.get<ReportSummary>(`/reports/summary?period=${period}`),
  getDaily: () => client.get<DailyReport>('/reports/daily'),
  getAnalytics: () => client.get<Analytics>('/reports/analytics'),
  getWeeklyCheckup: () => client.get<WeeklyCheckup>('/reports/weekly-checkup'),
  /** Profit on goods for a period (owner only). */
  getProfit: (period: ProfitPeriod) => client.get<ProfitReport>(`/reports/profit?period=${period}`),
  /** Active months towards Misa Loans (owner only). */
  getLoanProgress: () => client.get<LoanProgressData>('/loans/progress'),
  /** Recent days that had records (the server returns at most 36). */
  getDailyActivity: () => client.get<Analytics>('/reports/analytics?period=daily&limit=36'),
  /** The month's report as a PDF (month is 1-12). */
  getMonthlyPdf: (year: number, month: number) =>
    client.getFile(`/reports/monthly-pdf?year=${year}&month=${month}`),
};
