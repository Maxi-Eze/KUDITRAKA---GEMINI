import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { ReportSummary, Analytics } from '@/lib/api/reports';

interface KpiCardsProps {
  summary?: ReportSummary;
  analytics?: Analytics;
  transactionCount?: number;
  isLoading?: boolean;
}

function getMonthNet(analytics: Analytics): number {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const point = analytics.timeline.find((p) => p.period.slice(0, 7) === currentMonth);
  return point?.net_profit ?? 0;
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

export function KpiCards({ summary, analytics, transactionCount, isLoading }: KpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const monthNet = analytics ? getMonthNet(analytics) : 0;

  const cards = [
    {
      label: "Today's Income",
      value: formatCurrency(summary?.total_income ?? 0),
      icon: TrendingUp,
      color: 'text-emerald-500',
    },
    {
      label: "Today's Expenses",
      value: formatCurrency(summary?.total_expenses ?? 0),
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      label: 'This Month Net',
      value: formatCurrency(monthNet),
      icon: Wallet,
      color: 'text-primary',
    },
    {
      label: 'Transactions',
      value: String(transactionCount ?? 0),
      icon: Receipt,
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
            <card.icon className={cn('h-4 w-4', card.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
