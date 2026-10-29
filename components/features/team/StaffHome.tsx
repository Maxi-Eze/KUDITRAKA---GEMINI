'use client';

import Link from 'next/link';
import { List, Lock, MessageSquare, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { useUser } from '@/hooks/useAuth';
import { useMySummary } from '@/hooks/useTeam';
import { cn, formatCurrency } from '@/lib/utils';
import { hasRight } from '@/lib/permissions';

/** Home screen for a sales attendant: only their own sales today, and the things they can do. */
export function StaffHome() {
  const { data: user } = useUser();
  const { data: me, isLoading } = useMySummary();
  const today = me?.today;
  const firstName = (user?.staff?.name || '').trim().split(/\s+/)[0];

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{firstName ? `Hi ${firstName}` : 'Hi'}</h1>
        {user?.businessName && <Badge variant="secondary">{user.businessName}</Badge>}
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Your sales today</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-8 w-32" />
          ) : (
            <>
              <p className="mt-1 text-3xl font-semibold">{formatCurrency(today?.total ?? 0)}</p>
              <p className="text-sm text-muted-foreground">
                {today?.count ?? 0} {(today?.count ?? 0) === 1 ? 'sale' : 'sales'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {hasRight(user, 'record_sales') && (
        <Link href="/chat" className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
          <MessageSquare className="h-4 w-4" />
          Record a sale
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/inventory" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
          <Package className="h-4 w-4" />
          Check stock
        </Link>
        <Link href="/transactions" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
          <List className="h-4 w-4" />
          My sales
        </Link>
      </div>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0" />
        Only the shop owner can see profit and reports.
      </p>
    </div>
  );
}
