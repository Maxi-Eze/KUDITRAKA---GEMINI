'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DailySummaryCard } from '@/components/features/reports/DailySummaryCard';
import { MonthlyChart } from '@/components/features/reports/MonthlyChart';
import { ReportOverview } from '@/components/features/reports/ReportOverview';
import { useSummary, useAnalytics } from '@/hooks/useReports';
import type { ReportPeriod } from '@/lib/api/reports';

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('daily');

  const { data: summary, isLoading: summaryLoading } = useSummary(period);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  return (
    <div>
      <PageHeader
        title="Reports"
        description="View financial reports and analytics"
      />
      <div className="space-y-6">
        <DailySummaryCard
          period={period}
          onPeriodChange={setPeriod}
          summary={summary}
          isLoading={summaryLoading}
        />
        <ReportOverview
          analytics={analytics}
          isLoading={analyticsLoading}
        />
        <MonthlyChart
          analytics={analytics}
          isLoading={analyticsLoading}
        />
      </div>
    </div>
  );
}
