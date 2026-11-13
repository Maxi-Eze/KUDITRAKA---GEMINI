'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAdminCheckPayment, useAdminPayments } from '@/hooks/useCredits';
import { formatCredits, formatNaira } from '@/lib/credits';
import type { AdminPayment } from '@/lib/api/credits';

const FILTERS = [
  { status: '', label: 'All' },
  { status: 'pending', label: 'Waiting' },
  { status: 'successful', label: 'Paid' },
  { status: 'failed', label: 'Failed' },
  { status: 'expired', label: 'Expired' },
];

const STATUS: Record<AdminPayment['status'], { label: string; className: string }> = {
  successful: { label: 'Paid', className: 'bg-primary/15 text-primary' },
  pending: { label: 'Waiting', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' },
  failed: { label: 'Failed', className: 'bg-destructive/15 text-destructive' },
  expired: { label: 'Expired', className: 'bg-muted text-muted-foreground' },
  abandoned: { label: 'Not paid', className: 'bg-muted text-muted-foreground' },
};

const when = (d: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }).format(
    new Date(d),
  );

/**
 * Kuditraka team: every top-up. When a trader says "I paid but no credits", find the payment
 * (reference, phone or email) and press "Check again": the server asks Paystack and adds the
 * credits if the money arrived.
 */
export function PaymentsAdmin() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const list = useAdminPayments(search, status, true);
  const check = useAdminCheckPayment();
  const [checking, setChecking] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const checkAgain = (p: AdminPayment) => {
    setChecking(p.id);
    check.mutate(p.id, {
      onSuccess: (res) =>
        res.status === 'successful'
          ? toast.success(res.credited ? 'Money found. Credits added.' : 'Already paid. Credits were added before.')
          : toast.message(`Paystack says: ${res.status}. No money yet.`),
      onSettled: () => setChecking(null),
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Reference, phone or email" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setStatus(f.status)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              status === f.status ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (list.data?.payments ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No payments found.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {list.data!.payments.map((p) => {
            const s = STATUS[p.status] || STATUS.expired;
            const credits = p.credits !== null && p.credits !== undefined ? Number(p.credits) : p.amount;
            return (
              <li key={p.id} className="space-y-1.5 px-3 py-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.business_name || p.business_owner_name || 'No name'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {when(p.created_at)} · {p.reference}
                    </p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', s.className)}>{s.label}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {formatNaira(p.amount)} for {formatCredits(credits)}
                  </p>
                  {p.status !== 'successful' && (
                    <Button variant="outline" size="sm" disabled={checking === p.id} onClick={() => checkAgain(p)}>
                      {checking === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Check again
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
