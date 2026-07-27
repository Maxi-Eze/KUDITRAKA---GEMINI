'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import type { AnalyticsRow } from '@/lib/api/reports';

interface ReportOverviewProps {
  analytics?: AnalyticsRow[];
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-32" />
      </CardContent>
    </Card>
  );
}

export function ReportOverview({ analytics, isLoading }: ReportOverviewProps) {
  const stats = useMemo(() => {
    if (!analytics) return null;

    let totalIncome = 0;
    let totalExpense = 0;
    const months = new Set<string>();

    for (const row of analytics) {
      const total = parseFloat(row.total);
      months.add(row.month);
      if (row.type === 'income') totalIncome += total;
      if (row.type === 'expense') totalExpense += total;
    }

    const netProfit = totalIncome - totalExpense;
    const avgMonthly = months.size > 0 ? netProfit / months.size : 0;

    return { totalIncome, totalExpense, netProfit, avgMonthly };
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(stats?.totalIncome ?? 0),
      icon: TrendingUp,
      color: 'text-emerald-500',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(stats?.totalExpense ?? 0),
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      label: 'Net Profit',
      value: formatCurrency(stats?.netProfit ?? 0),
      icon: Wallet,
      color: 'text-primary',
    },
    {
      label: 'Avg Monthly',
      value: formatCurrency(stats?.avgMonthly ?? 0),
      icon: Calendar,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
