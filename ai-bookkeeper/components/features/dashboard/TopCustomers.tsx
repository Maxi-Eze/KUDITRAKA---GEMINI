import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';
import { Users } from 'lucide-react';
import Link from 'next/link';
import type { Transaction } from '@/lib/types';

interface TopCustomersProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

interface CustomerData {
  name: string;
  count: number;
  total: number;
}

export function TopCustomers({ transactions, isLoading }: TopCustomersProps) {
  const topCustomers = useMemo(() => {
    if (!transactions) return [];

    const map = new Map<string, CustomerData>();
    for (const tx of transactions) {
      if (tx.type !== 'income' || !tx.customer || tx.customer.trim() === '') continue;
      const key = tx.customer.trim().toLowerCase();
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.total += amount;
      } else {
        map.set(key, { name: tx.customer.trim(), count: 1, total: amount });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Top Customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Customer rankings will appear as you record transactions"
          />
        ) : (
          <div className="space-y-3">
            {topCustomers.map((customer, i) => (
              <div key={customer.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.count} transaction{customer.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium shrink-0 ml-3">
                  {formatCurrency(customer.total)}
                </p>
              </div>
            ))}
          </div>
        )}
        {topCustomers.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Link
              href="/customers"
              className="text-sm text-primary hover:underline"
            >
              View all customers
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
