import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import type { Transaction } from '@/lib/types';

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

function formatTxDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sorted = transactions
    ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];
  const recent = sorted.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions yet"
            description="Your recent transactions will appear here"
          />
        ) : (
          <div className="space-y-3">
            {recent.map((tx) => {
              const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
              return (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant={tx.type === 'income' ? 'default' : 'destructive'}>
                      {tx.type}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tx.item}</p>
                      {tx.customer && (
                        <p className="text-xs text-muted-foreground truncate">{tx.customer}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={cn(
                      'text-sm font-medium',
                      tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTxDate(tx.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {recent.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Link
              href="/transactions"
              className="text-sm text-primary hover:underline"
            >
              View all transactions
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
