'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DailySummaryCard } from '@/components/features/reports/DailySummaryCard';
import { MonthlyChart } from '@/components/features/reports/MonthlyChart';
import { ReportOverview } from '@/components/features/reports/ReportOverview';
import { MonthlyPdfCard } from '@/components/features/reports/MonthlyPdfCard';
import { ProfitByItem, ProfitThisMonth } from '@/components/features/reports/ProfitPanel';
import { BusinessStatementCard } from '@/components/features/reports/BusinessStatementCard';
import { YourWeek } from '@/components/features/dashboard/YourWeek';
import { TopCustomers } from '@/components/features/dashboard/TopCustomers';
import { RevenueChart } from '@/components/features/dashboard/RevenueChart';
import { ExpenseChart } from '@/components/features/dashboard/ExpenseChart';
import { useUser } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { isOwner } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useSummary, useAnalytics } from '@/hooks/useReports';
import type { ReportPeriod } from '@/lib/api/reports';

type Tab = 'summary' | 'profit' | 'charts' | 'files';

/**
 * Reports in four tabs so the page stays short on a phone: Summary (money in and out, your week,
 * top customers), Profit (owners), Charts, Files (statements to download). /reports?tab=profit
 * or /reports#profit-by-item opens a tab directly.
 */
export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [tab, setTab] = useState<Tab>('summary');
  const { data: summary, isLoading: summaryLoading } = useSummary(period);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: user } = useUser();
  const owner = isOwner(user);
  const list = Array.isArray(transactions) ? transactions : undefined;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'summary', label: 'Summary' },
    ...(owner ? [{ key: 'profit' as Tab, label: 'Profit' }] : []),
    { key: 'charts', label: 'Charts' },
    { key: 'files', label: 'Files' },
  ];

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('tab') as Tab | null;
    if (wanted && ['summary', 'profit', 'charts', 'files'].includes(wanted)) setTab(wanted);
    else if (window.location.hash === '#profit-by-item') setTab('profit');
  }, []);

  const shown: Tab = tab === 'profit' && !owner ? 'summary' : tab;

  return (
    <div>
      <PageHeader title="Reports" description="Your money in and out, profit, and statements" />

      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={shown === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-sm font-medium',
              shown === t.key ? 'bg-background shadow-sm' : 'text-muted-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {shown === 'summary' && (
          <>
            <DailySummaryCard period={period} onPeriodChange={setPeriod} summary={summary} isLoading={summaryLoading} />
            <YourWeek />
            <TopCustomers transactions={list} isLoading={txLoading} />
          </>
        )}

        {shown === 'profit' && (
          <>
            <ProfitThisMonth />
            <ProfitByItem />
          </>
        )}

        {shown === 'charts' && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <RevenueChart transactions={list} isLoading={txLoading} />
              <ExpenseChart analytics={analytics} isLoading={analyticsLoading} />
            </div>
            <ReportOverview analytics={analytics} isLoading={analyticsLoading} />
            <MonthlyChart analytics={analytics} isLoading={analyticsLoading} />
          </>
        )}

        {shown === 'files' && (
          <>
            {owner && <BusinessStatementCard />}
            <MonthlyPdfCard />
          </>
        )}
      </div>
    </div>
  );
}
