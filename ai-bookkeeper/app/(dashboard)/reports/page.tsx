'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { DailySummaryCard } from '@/components/features/reports/DailySummaryCard';
import { MonthlyChart } from '@/components/features/reports/MonthlyChart';
import { ReportOverview } from '@/components/features/reports/ReportOverview';
import { useDailySummary, useAnalytics } from '@/hooks/useReports';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(getToday);

  const { data: dailySummary, isLoading: dailyLoading } = useDailySummary(selectedDate);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  return (
    <div>
      <PageHeader
        title="Reports"
        description="View financial reports and analytics"
      />
      <div className="space-y-6">
        <DailySummaryCard
          date={selectedDate}
          onDateChange={setSelectedDate}
          summary={dailySummary}
          isLoading={dailyLoading}
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
