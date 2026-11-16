'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/hooks/keys';
import { receiptsApi, type Payment } from '@/lib/api/receipts';
import { formatCredits } from '@/lib/credits';
import { formatCurrency } from '@/lib/utils';

const dateText = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' }).format(new Date(iso));

const STATUS: Record<string, string> = { pending: 'Waiting', failed: 'Failed', expired: 'Expired', abandoned: 'Not paid' };

/** Every top-up, newest first, with a receipt for each paid one. Hidden until the server has it. */
export function PaymentsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.credits.payments(),
    queryFn: receiptsApi.payments,
    retry: false,
  });
  const [downloading, setDownloading] = useState<string | null>(null);

  if (isError) return null; // server not ready yet
  const payments = data?.payments ?? [];

  const download = async (p: Payment) => {
    setDownloading(p.id);
    try {
      const { blob, filename } = await receiptsApi.paymentReceipt(p.id, 'pdf');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'misa-receipt.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not get the receipt. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold">Payments</h2>
      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No top-ups yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{formatCredits(p.credits)}</p>
                <p className="text-muted-foreground">
                  {dateText(p.paid_at || p.created_at)} · {formatCurrency(p.amount_paid)}
                </p>
              </div>
              {p.has_receipt ? (
                <Button variant="outline" size="sm" className="h-10 shrink-0" onClick={() => download(p)} disabled={downloading === p.id}>
                  {downloading === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Receipt
                </Button>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">{STATUS[p.status] || p.status}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
