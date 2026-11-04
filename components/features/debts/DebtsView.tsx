'use client';

import { useMemo, useState } from 'react';
import { HandCoins, Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/hooks/useAuth';
import { useAddDebt, useDebts } from '@/hooks/useDebts';
import { isOwner } from '@/lib/permissions';
import { PHONE_ERROR, toNigerianInternational } from '@/lib/phone';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import { CustomerDebtDialog } from './CustomerDebtDialog';
import { OVERDUE_DAYS, daysLabel, daysSince } from './debt-utils';

type Filter = 'all' | 'overdue' | 'paid';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: `Over ${OVERDUE_DAYS} days` },
  { value: 'paid', label: 'Paid' },
];

export function DebtsView() {
  const { data: user } = useUser();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [openName, setOpenName] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { data: open, isLoading } = useDebts('open');
  const { data: paid, isLoading: paidLoading } = useDebts('paid');

  const rows = useMemo(() => {
    const source = filter === 'paid' ? paid?.debtors : open?.debtors;
    const term = search.trim().toLowerCase();
    return (source || [])
      .filter((d) => filter !== 'overdue' || daysSince(d.oldestOpenAt) > OVERDUE_DAYS)
      .filter((d) => !term || d.customerName.toLowerCase().includes(term));
  }, [filter, search, open, paid]);

  const loading = filter === 'paid' ? paidLoading : isLoading;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Debts</h1>
        {isOwner(user) && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Add an old debt
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Customers owe you</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-8 w-40" />
          ) : (
            <>
              <p className="mt-1 text-3xl font-semibold">{formatCurrency(open?.totalOutstanding ?? 0)}</p>
              <p className="text-sm text-muted-foreground">
                {open?.debtorCount ?? 0} {(open?.debtorCount ?? 0) === 1 ? 'person' : 'people'}
                {(open?.overdueAmount ?? 0) > 0 && (
                  <span className="text-amber-500">
                    {` · ${formatCurrency(open?.overdueAmount ?? 0)} owed for over ${OVERDUE_DAYS} days`}
                  </span>
                )}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Show">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                filter === f.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0 px-4">
          {loading && <Skeleton className="my-4 h-12 w-full" />}

          {!loading && rows.length === 0 && (
            <div className="flex items-start gap-3 py-6 text-sm text-muted-foreground">
              <HandCoins className="h-5 w-5 shrink-0" />
              {filter === 'paid'
                ? 'Nobody has paid off a debt yet.'
                : filter === 'overdue'
                  ? `Nobody has owed you for more than ${OVERDUE_DAYS} days.`
                  : search
                    ? 'No one by that name owes you.'
                    : 'Nobody owes you. When you sell on credit, say "Sold rice to Mama Bisi on credit, 50k" in chat.'}
            </div>
          )}

          {!loading &&
            rows.map((d) => {
              const days = daysSince(d.oldestOpenAt);
              const overdue = filter !== 'paid' && days > OVERDUE_DAYS;
              return (
                <button
                  key={d.customerName}
                  type="button"
                  onClick={() => setOpenName(d.customerName)}
                  className="flex w-full items-center gap-3 py-3 text-left hover:bg-accent/40"
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      overdue ? 'bg-amber-500/15 text-amber-500' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {getInitials(d.customerName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.customerName}</p>
                    <p className={cn('truncate text-xs', overdue ? 'text-amber-500' : 'text-muted-foreground')}>
                      {filter === 'paid'
                        ? `Paid ${formatCurrency(d.totalPaid)}`
                        : [daysLabel(days), d.items.join(', ')].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {filter === 'paid' ? 'Paid' : formatCurrency(d.balance)}
                  </span>
                </button>
              );
            })}
        </CardContent>
      </Card>

      <CustomerDebtDialog name={openName} onClose={() => setOpenName(null)} />
      <AddDebtDialog open={adding} onOpenChange={setAdding} />
    </div>
  );
}

/** Owner adds a debt from before Misa. It goes into the book but is not counted as a new sale. */
function AddDebtDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const addDebt = useAddDebt();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setPhone('');
    setAmount('');
    setItem('');
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Enter the customer's name");
    const value = Number(amount);
    if (!value || value <= 0) return setError('Enter how much they owe');
    let international: string | null = null;
    if (phone.trim()) {
      international = toNigerianInternational(phone);
      if (!international) return setError(PHONE_ERROR);
    }
    setError(null);
    addDebt.mutate(
      { customer_name: name.trim(), customer_phone: international, amount: value, item: item.trim() || null },
      {
        onSuccess: () => {
          toast.success(`${name.trim()} added`);
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <form onSubmit={submit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add an old debt</DialogTitle>
            <DialogDescription>
              For money people owed you before you started using Misa. It won&apos;t be counted as a new sale.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="debt-name" required>Who owes you?</Label>
            <Input id="debt-name" placeholder="Mama Bisi" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-amount" required>How much?</Label>
            <Input id="debt-amount" type="number" inputMode="numeric" min="0" placeholder="30000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-item">For what?</Label>
            <Input id="debt-item" placeholder="Rice and beans" value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-phone">Their phone number</Label>
            <Input id="debt-phone" type="tel" inputMode="tel" placeholder="0803 456 7890" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <p className="text-xs text-muted-foreground">So you can send a reminder on WhatsApp.</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={addDebt.isPending} className="w-full sm:w-auto">
              {addDebt.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add debt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
