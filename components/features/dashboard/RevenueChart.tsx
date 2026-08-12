'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import type { Transaction } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface RevenueChartProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export function RevenueChart({ transactions, isLoading }: RevenueChartProps) {
  const last7Days = useMemo(() => getLast7Days(), []);

  const chartData = useMemo(() => {
    if (!transactions) return { labels: last7Days.map(formatDateLabel), datasets: [] };

    const incomeByDate: Record<string, number> = {};
    for (const day of last7Days) incomeByDate[day] = 0;

    for (const tx of transactions) {
      if (tx.type !== 'income') continue;
      const day = tx.date.split('T')[0];
      if (day in incomeByDate) {
        incomeByDate[day] += typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      }
    }

    return {
      labels: last7Days.map(formatDateLabel),
      datasets: [
        {
          data: last7Days.map((d) => incomeByDate[d]),
          borderColor: 'oklch(0.894 0.231 127)',
          backgroundColor: 'oklch(0.894 0.231 127 / 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: 'oklch(0.894 0.231 127)',
          borderWidth: 2,
        },
      ],
    };
  }, [transactions, last7Days]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Revenue Trend (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Revenue Trend (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: 'oklch(0.65 0.01 285)', font: { size: 11 } } },
                y: { grid: { color: 'oklch(0.2 0.005 285)' }, ticks: { color: 'oklch(0.65 0.01 285)', font: { size: 11 } } },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
