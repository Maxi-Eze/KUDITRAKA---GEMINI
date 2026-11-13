'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inventoryApi } from '@/lib/api/inventory';
import { queryKeys } from '@/hooks/keys';
import { formatCurrency } from '@/lib/utils';

/**
 * Under a saved restock in chat: "Did you pay for delivery or loading on this stock?" An amount is
 * shared into the stock's cost; "No" is fine. The server decides when to ask (once a day at most).
 */
export function DeliveryPrompt({ transactionIds, onDone }: { transactionIds: string[]; onDone?: () => void }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const value = Number(amount.replace(/[,\s₦]/g, ''));
  const valid = Number.isFinite(value) && value > 0;

  const answer = async (paid: number | null) => {
    setBusy(true);
    setError(null);
    try {
      const res = await inventoryApi.deliveryAnswer({ transaction_ids: transactionIds, amount: paid });
      if (res.added) {
        qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
        qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
        qc.invalidateQueries({ queryKey: queryKeys.reports.all });
        setDone(`Added ${formatCurrency(res.added)} delivery to the cost of this stock.`);
      } else {
        setDone('Okay, no delivery added.');
      }
      qc.invalidateQueries({ queryKey: queryKeys.reports.staffChecks() });
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save that. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-start gap-2 text-sm text-emerald-500">
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{done}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md bg-muted/50 p-2 text-sm">
      <p className="flex items-start gap-2">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Did you pay for delivery or loading on this stock?
      </p>
      <div className="flex gap-2">
        <Input
          aria-label="Delivery amount"
          inputMode="decimal"
          placeholder="₦"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-8"
        />
        <Button size="sm" onClick={() => answer(value)} disabled={!valid || busy}>
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={() => answer(null)} disabled={busy}>
          No
        </Button>
      </div>
      {error && <p className="text-xs text-amber-500">{error}</p>}
    </div>
  );
}
