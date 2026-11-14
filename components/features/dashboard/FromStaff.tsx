'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Tag, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeliveryPrompt } from '@/components/features/chat/DeliveryPrompt';
import { useStaffChecks } from '@/hooks/useReports';
import { queryKeys } from '@/hooks/keys';
import { inventoryApi } from '@/lib/api/inventory';
import { reportsApi, type StaffChecks } from '@/lib/api/reports';
import { formatCurrency } from '@/lib/utils';

const dayText = (ymd: string) =>
  new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

const listText = (items: string[]) =>
  items.length <= 2 ? items.join(' and ') : `${items.slice(0, 2).join(', ')} and ${items.length - 2} more`;

/**
 * Owner's Home: what only the employer can answer about staff restocks (delivery paid? new price?).
 * The evening WhatsApp message links here (/dashboard#from-staff).
 */
export function FromStaff() {
  const { data } = useStaffChecks();
  const ref = useRef<HTMLDivElement>(null);
  const count = data?.count ?? 0;

  useEffect(() => {
    if (count && window.location.hash === '#from-staff') ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [count]);

  if (!data || !count) return null;

  return (
    <Card id="from-staff" ref={ref} className="scroll-mt-20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">From your staff</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {data.delivery.map((d) => (
          <div key={d.key} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="min-w-0 flex-1 space-y-2 text-sm">
              <p>
                <span className="font-semibold">{d.member}</span>
                {` restocked ${listText(d.items)} on ${dayText(d.date)}.`}
              </p>
              <DeliveryPrompt transactionIds={d.restock_ids} onDone={() => toast.success('Saved')} />
            </div>
          </div>
        ))}
        {data.prices.map((p) => (
          <PriceRow key={p.item_id} row={p} />
        ))}
      </CardContent>
    </Card>
  );
}

function PriceRow({ row }: { row: StaffChecks['prices'][number] }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const act = async (change: boolean) => {
    setBusy(true);
    try {
      if (change) {
        await inventoryApi.update(row.item_id, { selling_price: row.suggested });
        qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
        setDone(`${row.item} now sells at ${formatCurrency(row.suggested)}.`);
        toast.success(`${row.item} now sells at ${formatCurrency(row.suggested)}`);
      } else {
        await reportsApi.keepStaffCheckPrice(row.item_id, row.suggested);
        setDone('Okay, the price stays the same.');
      }
      qc.invalidateQueries({ queryKey: queryKeys.reports.staffChecks() });
    } catch (e) {
      setDone(e instanceof Error ? e.message : 'Could not save that. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Tag className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1 space-y-2 text-sm">
        <p>
          <span className="font-semibold">{row.item}</span>
          {` cost more (restocked by ${row.member}). Sell at ${formatCurrency(row.suggested)} to keep your profit?`}
          {row.price_now != null && <span className="text-muted-foreground">{` Now ${formatCurrency(row.price_now)}.`}</span>}
        </p>
        {done ? (
          <p className="flex items-start gap-2 text-emerald-500">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            {done}
          </p>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => act(true)} disabled={busy}>
              {`Change to ${formatCurrency(row.suggested)}`}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => act(false)} disabled={busy}>
              Keep price
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
