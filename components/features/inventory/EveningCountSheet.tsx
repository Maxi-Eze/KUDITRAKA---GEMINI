'use client';

import { useMemo, useState } from 'react';
import { Check, History, Loader2, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSaveStockCount, useStockCounts } from '@/hooks/useInventory';
import { cn, formatCurrency, formatTxDate } from '@/lib/utils';
import { STAFF_COPY } from '@/lib/copy';
import type { CountDifference, InventoryItem, StockCount } from '@/lib/types';

type Step = 'count' | 'result' | 'history';

interface EveningCountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  /** A staff member is counting (past counts by the owner then say "your employer"). */
  isStaff?: boolean;
}

interface Entry {
  value: string;
  reason: string;
}

const counted = (e?: Entry) => {
  const v = e?.value.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
};

const diffText = (d: number) => (d < 0 ? `${-d} short` : `${d} extra`);

/** Count what's on the shelf at closing, for many items at once, then see what's short. */
export function EveningCountSheet({ open, onOpenChange, items, isStaff = false }: EveningCountSheetProps) {
  const [step, setStep] = useState<Step>('count');
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [search, setSearch] = useState('');
  const [result, setResult] = useState<StockCount | null>(null);
  const save = useSaveStockCount();
  const history = useStockCounts(open && step === 'history');

  const close = (next: boolean) => {
    if (!next) {
      setStep('count');
      setEntries({});
      setSearch('');
      setResult(null);
    }
    onOpenChange(next);
  };

  const set = (id: string, patch: Partial<Entry>) =>
    setEntries((es) => ({ ...es, [id]: { ...(es[id] ?? { value: '', reason: '' }), ...patch } }));

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...items].filter((i) => !q || i.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search]);

  const lines = items
    .map((i) => ({ item: i, n: counted(entries[i.id]) }))
    .filter((l): l is { item: InventoryItem; n: number } => l.n !== null);
  const bad = lines.some((l) => Number.isNaN(l.n));

  const submit = () =>
    save.mutate(
      {
        counts: lines.map((l) => ({
          item_id: l.item.id,
          actual_stock: l.n,
          reason: l.n !== l.item.stock ? entries[l.item.id]?.reason.trim() || null : null,
        })),
      },
      {
        onSuccess: (r) => {
          setResult(r);
          setStep('result');
        },
      }
    );

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent
        side="right"
        // On phones, don't focus the search box: the keyboard would cover the list.
        initialFocus={(type) => type !== 'touch'}
        className="flex flex-col data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>{step === 'history' ? 'Past counts' : 'Evening count'}</SheetTitle>
        </SheetHeader>

        {step === 'count' && (
          <>
            <div className="space-y-3 px-4">
              <p className="text-sm text-muted-foreground">
                Count what&apos;s on the shelf and type it in. Leave a box empty to skip that item.
              </p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Find an item" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
              {shown.map((i) => {
                const e = entries[i.id];
                const n = counted(e);
                const diff = n !== null && !Number.isNaN(n) ? n - i.stock : 0;
                return (
                  <li key={i.id} className={cn('rounded-lg border p-3', diff ? 'border-amber-500/60' : 'border-border')}>
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{i.name}</p>
                        <p className="text-xs text-muted-foreground">{`Misa expects ${i.stock}`}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={n === i.stock ? 'default' : 'outline'}
                        aria-label={`${i.name}: same as expected, ${i.stock}`}
                        onClick={() => set(i.id, { value: String(i.stock) })}
                      >
                        <Check className="h-3 w-3" />
                        {i.stock}
                      </Button>
                      <Input
                        aria-label={`${i.name}: counted`}
                        inputMode="numeric"
                        className="w-20"
                        placeholder="Count"
                        value={e?.value ?? ''}
                        onChange={(ev) => set(i.id, { value: ev.target.value })}
                      />
                    </div>
                    {Number.isNaN(n) && <p className="mt-1 text-xs text-destructive">Enter a whole number</p>}
                    {diff !== 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="shrink-0 text-xs text-amber-500">{diffText(diff)}</span>
                        <Input
                          aria-label={`${i.name}: why it's different`}
                          className="h-8 text-sm"
                          placeholder="Why? (optional)"
                          value={e?.reason ?? ''}
                          onChange={(ev) => set(i.id, { reason: ev.target.value })}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
              {!shown.length && <p className="py-8 text-center text-sm text-muted-foreground">No items found.</p>}
            </ul>

            <div className="space-y-2 border-t border-border p-4">
              <Button className="w-full" disabled={!lines.length || bad || save.isPending} onClick={submit}>
                {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {lines.length ? `Save count (${lines.length} of ${items.length})` : 'Count at least one item'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep('history')}>
                <History className="h-4 w-4" />
                Past counts
              </Button>
            </div>
          </>
        )}

        {step === 'result' && result && (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
            <CountSummary count={result} />
            <p className="text-xs text-muted-foreground">
              Stock is now set to what you counted. Short items can mean a sale that wasn&apos;t recorded, damaged goods, or
              missing stock.
            </p>
            <Button className="w-full" onClick={() => close(false)}>
              Done
            </Button>
          </div>
        )}

        {step === 'history' && (
          <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
            {history.isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />}
            {history.data?.length === 0 && <p className="text-sm text-muted-foreground">No counts yet.</p>}
            {history.data?.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  {`${formatTxDate(c.created_at)} · ${new Date(c.created_at).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })} · by ${c.recorded_by ?? (isStaff ? STAFF_COPY.countedByOwner : 'you')}`}
                </p>
                <CountSummary count={c} compact />
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => setStep('count')}>
              Back to counting
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CountSummary({ count, compact = false }: { count: StockCount; compact?: boolean }) {
  const money = count.short_value !== undefined;
  if (!count.short.length && !count.over.length) {
    return (
      <p className={cn('font-medium', !compact && 'rounded-lg border border-primary/40 bg-primary/10 p-4 text-center')}>
        {`All ${count.items_counted} ${count.items_counted === 1 ? 'item matches' : 'items match'}. Well done!`}
      </p>
    );
  }
  const block = (title: string, ds: CountDifference[], total?: number) =>
    ds.length > 0 && (
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {title}
          {money && total ? <span className="text-muted-foreground">{` · worth about ${formatCurrency(total)}`}</span> : null}
        </p>
        <ul className="space-y-1 text-sm">
          {ds.map((d) => (
            <li key={d.item_id} className="flex justify-between gap-2">
              <span className="min-w-0 truncate">
                {d.name}
                {d.reason && <span className="text-muted-foreground">{` (${d.reason})`}</span>}
              </span>
              <span className={cn('shrink-0', d.difference < 0 ? 'text-destructive' : 'text-primary')}>
                {diffText(d.difference)}
                {money && d.value ? <span className="text-muted-foreground">{` · ${formatCurrency(d.value)}`}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="space-y-3">
      {!compact && <p className="text-sm text-muted-foreground">{`${count.items_counted} counted · ${count.items_matched} match`}</p>}
      {block(`${count.short.length} ${count.short.length === 1 ? 'item' : 'items'} short`, count.short, count.short_value)}
      {block(`${count.over.length} extra`, count.over, count.over_value)}
    </div>
  );
}
