'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { BarChart3 } from 'lucide-react';
import type { AnalyticsRow } from '@/lib/api/reports';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface MonthlyChartProps {
  analytics?: AnalyticsRow[];
  isLoading: boolean;
}

function getLast6Months(): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-NG', { month: 'short' });
    months.push({ key, label });
  }
  return months;
}

export function MonthlyChart({ analytics, isLoading }: MonthlyChartProps) {
  const last6Months = useMemo(() => getLast6Months(), []);

  const chartData = useMemo(() => {
    if (!analytics) return null;

    const incomeByMonth: Record<string, number> = {};
    const expenseByMonth: Record<string, number> = {};
    for (const m of last6Months) {
      incomeByMonth[m.key] = 0;
      expenseByMonth[m.key] = 0;
    }

    for (const row of analytics) {
      if (!(row.month in incomeByMonth)) continue;
      const total = parseFloat(row.total);
      if (row.type === 'income') incomeByMonth[row.month] += total;
      if (row.type === 'expense') expenseByMonth[row.month] += total;
    }

    return {
      labels: last6Months.map((m) => m.label),
      datasets: [
        {
          label: 'Income',
          data: last6Months.map((m) => incomeByMonth[m.key]),
          backgroundColor: 'oklch(0.894 0.231 127)',
          borderRadius: 4,
        },
        {
          label: 'Expense',
          data: last6Months.map((m) => expenseByMonth[m.key]),
          backgroundColor: 'oklch(0.65 0.2 25)',
          borderRadius: 4,
        },
      ],
    };
  }, [analytics, last6Months]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = chartData && chartData.datasets.some((ds) => ds.data.some((v) => v > 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Monthly Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[250px]">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: 'top', labels: { boxWidth: 12 } },
                  tooltip: { mode: 'index', intersect: false },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: 'oklch(0.65 0.01 285)', font: { size: 11 } } },
                  y: { grid: { color: 'oklch(0.2 0.005 285)' }, ticks: { color: 'oklch(0.65 0.01 285)', font: { size: 11 } } },
                },
              }}
            />
          </div>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No analytics data"
            description="Monthly trends will appear as you record transactions"
          />
        )}
      </CardContent>
    </Card>
  );
}
