'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useDailySummary, useAnalytics } from '@/hooks/useReports';
import { KpiCards } from '@/components/features/dashboard/KpiCards';
import { RevenueChart } from '@/components/features/dashboard/RevenueChart';
import { ExpenseChart } from '@/components/features/dashboard/ExpenseChart';
import { RecentTransactions } from '@/components/features/dashboard/RecentTransactions';
import { TopCustomers } from '@/components/features/dashboard/TopCustomers';

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0];
  const { data: dailySummary, isLoading: dailyLoading } = useDailySummary(today);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const isAnyLoading = dailyLoading || analyticsLoading || txLoading;

  return (
    <div className="space-y-6">
      <KpiCards
        dailySummary={dailySummary}
        analytics={analytics}
        transactionCount={Array.isArray(transactions) ? transactions.length : 0}
        isLoading={isAnyLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart
          transactions={Array.isArray(transactions) ? transactions : undefined}
          isLoading={txLoading}
        />
        <ExpenseChart analytics={analytics} isLoading={analyticsLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions
          transactions={Array.isArray(transactions) ? transactions : undefined}
          isLoading={txLoading}
        />
        <TopCustomers
          transactions={Array.isArray(transactions) ? transactions : undefined}
          isLoading={txLoading}
        />
      </div>
    </div>
  );
}
