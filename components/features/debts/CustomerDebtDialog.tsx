'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Banknote, Loader2, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@/hooks/useAuth';
import { useCustomerDebts, useRecordPayment, useRemoveDebt } from '@/hooks/useDebts';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { queryKeys } from '@/hooks/keys';
import { customersApi } from '@/lib/api';
import { hasRight, isOwner } from '@/lib/permissions';
import { cn, formatCurrency } from '@/lib/utils';
import { whatsappReminderLink } from './debt-utils';

/** "0803 456 7890" from "+2348034567890" */
const localPhone = (phone: string) =>
  phone.replace(/^\+234/, '0').replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3');

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });

type Panel = 'pay' | 'credit' | null;

export function CustomerDebtDialog({ name, onClose }: { name: string | null; onClose: () => void }) {
  const { data: user } = useUser();
  const { data, isLoading } = useCustomerDebts(name);
  const [panel, setPanel] = useState<Panel>(null);

  if (!name) return null;
  const close = () => {
    setPanel(null);
    onClose();
  };
  const owes = data?.balance ?? 0;
  const paidShare = data && data.totalCredit > 0 ? Math.min(100, (data.totalPaid / data.totalCredit) * 100) : 0;
  const openItems = Array.from(
    new Set((data?.debts || []).filter((d) => d.balance > 0 && d.item_description).map((d) => d.item_description as string))
  );

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{data?.customerName || name}</DialogTitle>
          <DialogDescription>{data?.customerPhone ? localPhone(data.customerPhone) : 'No phone number saved'}</DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">{owes > 0 ? 'Owes you' : 'Owes you nothing'}</p>
              <p className="text-3xl font-semibold">{formatCurrency(owes)}</p>
              {data.totalCredit > 0 && (
                <>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-emerald-500" style={{ width: `${paidShare}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {`Paid ${formatCurrency(data.totalPaid)} of ${formatCurrency(data.totalCredit)}`}
                  </p>
                </>
              )}
            </div>

            {hasRight(user, 'record_sales') && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setPanel(panel === 'pay' ? null : 'pay')} disabled={owes <= 0} variant={panel === 'pay' ? 'secondary' : 'default'}>
                  <Banknote className="h-4 w-4" />
                  Record payment
                </Button>
                <Button variant="outline" onClick={() => setPanel(panel === 'credit' ? null : 'credit')}>
                  <Plus className="h-4 w-4" />
                  New credit sale
                </Button>
              </div>
            )}

            {panel === 'pay' && <PaymentForm name={data.customerName} owes={owes} onDone={() => setPanel(null)} />}
            {panel === 'credit' && <CreditSaleForm name={data.customerName} onDone={() => setPanel(null)} />}

            {owes > 0 && (
              <a
                href={whatsappReminderLink({
                  name: data.customerName,
                  phone: data.customerPhone,
                  balance: owes,
                  items: openItems,
                  businessName: user?.businessName,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              >
                <MessageCircle className="h-4 w-4" />
                Remind on WhatsApp
              </a>
            )}

            <EntriesList entries={data.debts} canRemove={isOwner(user)} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentForm({ name, owes, onDone }: { name: string; owes: number; onDone: () => void }) {
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return setError('Enter how much they paid');
    if (value > owes) return setError(`${name} only owes ${formatCurrency(owes)}`);
    setError(null);
    recordPayment.mutate(
      { customer_name: name, amount: value },
      {
        onSuccess: (res) => {
          toast.success(res.remaining > 0 ? `Saved. ${name} now owes ${formatCurrency(res.remaining)}` : `Saved. ${name} has paid everything`);
          onDone();
        },
      }
    );
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-2 rounded-lg border p-3">
      <Label htmlFor="pay-amount">How much did they pay?</Label>
      <div className="flex gap-2">
        <Input id="pay-amount" type="number" inputMode="numeric" min="0" placeholder={String(owes)} value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button type="submit" disabled={recordPayment.isPending}>
          {recordPayment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
      <button type="button" className="text-xs text-primary hover:underline" onClick={() => setAmount(String(owes))}>
        {`They paid everything (${formatCurrency(owes)})`}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">This lowers what they owe. It isn&apos;t counted as a new sale.</p>
    </form>
  );
}

/** More goods on credit: saved as one sale today, and the amount goes into the debtors book. */
function CreditSaleForm({ name, onDone }: { name: string; onDone: () => void }) {
  const qc = useQueryClient();
  const createTransaction = useCreateTransaction();
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    const qty = Math.max(1, Math.round(Number(quantity) || 1));
    if (!item.trim()) return setError('What did they take?');
    if (!value || value <= 0) return setError('Enter how much it costs');
    setError(null);
    setBusy(true);
    try {
      const customer = await customersApi.findOrCreate(name);
      createTransaction.mutate(
        {
          type: 'income',
          amount: value,
          item: item.trim(),
          quantity: qty,
          customer_id: customer.id,
          payment_method: 'credit',
          date: new Date().toISOString().split('T')[0],
          raw_input: '',
          is_credit: true,
        },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.debts.all });
            toast.success(`Saved. ${formatCurrency(value)} added to what ${name} owes`);
            onDone();
          },
          onSettled: () => setBusy(false),
        }
      );
    } catch {
      setBusy(false);
      setError('Could not save. Please try again.');
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-2 rounded-lg border p-3">
      <div className="grid grid-cols-[1fr_5rem] gap-2">
        <div className="space-y-1">
          <Label htmlFor="credit-item">What did they take?</Label>
          <Input id="credit-item" placeholder="Rice" value={item} onChange={(e) => setItem(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="credit-qty">How many?</Label>
          <Input id="credit-qty" type="number" inputMode="numeric" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="credit-amount">Total price</Label>
        <div className="flex gap-2">
          <Input id="credit-amount" type="number" inputMode="numeric" min="0" placeholder="25000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Saved as a sale today, and added to what they owe.</p>
    </form>
  );
}

function EntriesList({ entries, canRemove }: { entries: { id: string; item_description: string | null; total_amount: number; amount_paid: number; balance: number; created_at: string }[]; canRemove: boolean }) {
  const removeDebt = useRemoveDebt();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  if (entries.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-sm font-medium">Credit history</p>
      <ul className="divide-y divide-border text-sm">
        {entries.map((d) => (
          <li key={d.id} className="py-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate">{`${d.item_description || 'Credit'} · ${shortDate(d.created_at)}`}</p>
                <p className={cn('text-xs', d.balance > 0 ? 'text-muted-foreground' : 'text-emerald-500')}>
                  {d.balance > 0
                    ? d.amount_paid > 0
                      ? `Paid ${formatCurrency(d.amount_paid)}, still owes ${formatCurrency(d.balance)}`
                      : `Owes ${formatCurrency(d.balance)}`
                    : 'Paid in full'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="font-medium">{formatCurrency(d.total_amount)}</span>
                {canRemove && (
                  <Button variant="ghost" size="icon-xs" title="Remove this entry" onClick={() => setConfirmId(confirmId === d.id ? null : d.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            {confirmId === d.id && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-muted p-2 text-xs">
                <span>Remove this entry? Only do this if it was a mistake.</span>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={removeDebt.isPending}
                  onClick={() => removeDebt.mutate(d.id, { onSuccess: () => { setConfirmId(null); toast.success('Removed'); } })}
                >
                  Remove
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">Each payment is taken off the oldest debt first.</p>
    </div>
  );
}
