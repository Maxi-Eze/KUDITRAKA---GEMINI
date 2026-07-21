'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { formatCurrency } from '@/lib/utils';
import type { AnalyticsRow } from '@/lib/api/reports';

ChartJS.register(ArcElement, Tooltip);

interface ExpenseChartProps {
  analytics?: AnalyticsRow[];
  isLoading?: boolean;
}

export function ExpenseChart({ analytics, isLoading }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    if (!analytics) return null;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthRows = analytics.filter((r) => r.month === currentMonth);

    let income = 0;
    let expense = 0;
    for (const row of monthRows) {
      const total = parseFloat(row.total);
      if (row.type === 'income') income += total;
      if (row.type === 'expense') expense += total;
    }

    return { income, expense, net: income - expense };
  }, [analytics]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income vs Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = chartData && (chartData.income > 0 || chartData.expense > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Income vs Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[200px] flex items-center justify-center">
          {hasData ? (
            <>
              <Doughnut
                data={{
                  labels: ['Income', 'Expense'],
                  datasets: [
                    {
                      data: [chartData.income, chartData.expense],
                      backgroundColor: ['oklch(0.85 0.18 130)', 'oklch(0.65 0.2 25)'],
                      borderWidth: 0,
                      hoverOffset: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '70%',
                  plugins: { legend: { display: false }, tooltip: { enabled: true } },
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-muted-foreground">Net</span>
                <span className="text-lg font-bold">{formatCurrency(chartData.net)}</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No data this month</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
