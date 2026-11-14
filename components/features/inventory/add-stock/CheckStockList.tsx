'use client';

import { useMemo, useState } from 'react';
import { Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';
import type { StockIntakeLine, StockLineMatch, StockRef, StockSaveLine } from '@/lib/types';

/** One line on the "Check these items" screen. */
export interface CheckRow {
  key: string;
  /** What the list, photo or file called it. */
  original: string;
  name: string;
  quantity: string;
  unitCost: string;
  sellingPrice: string;
  barcode?: string | null;
  /** Free or bonus goods: no cost. */
  free?: boolean;
  match: StockLineMatch;
  /** existing: add to `item` · new: a new stock item · undecided: still asking "Did you mean…?" */
  choice: 'existing' | 'new' | 'undecided';
  item?: StockRef;
}

let rowSeq = 0;

export function toCheckRow(line: StockIntakeLine & { match: StockLineMatch }): CheckRow {
  const existing = line.match.type === 'exact' || line.match.type === 'alias';
  return {
    key: `row-${rowSeq++}`,
    original: line.name,
    name: existing ? line.match.item!.name : line.name,
    quantity: line.quantity != null ? String(line.quantity) : '',
    unitCost: line.unit_cost != null ? String(line.unit_cost) : '',
    sellingPrice: line.selling_price != null ? String(line.selling_price) : '',
    barcode: line.barcode ?? null,
    free: Boolean(line.free),
    match: line.match,
    choice: existing ? 'existing' : line.match.type === 'suggest' ? 'undecided' : 'new',
    item: existing ? line.match.item : undefined,
  };
}

const positive = (s: string) => {
  const n = Number(s.replace(/[,\s₦]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

interface CheckStockListProps {
  rows: CheckRow[];
  onRowsChange: (rows: CheckRow[]) => void;
  supplier?: string | null;
  unreadable?: string[];
  /** Show the Delivery and Discount boxes (the server can use them). */
  showExtras: boolean;
  /** What the invoice showed, to fill the boxes in. */
  delivery?: number | null;
  discount?: number | null;
  /** Staff without "Change stock counts" can only add new items. */
  canRestock: boolean;
  /** Staff without "Record sales and expenses" can't record what was paid. */
  canRecordExpense: boolean;
  defaultRecordExpense: boolean;
  saving: boolean;
  onBack: () => void;
  onSave: (lines: StockSaveLine[], recordExpense: boolean, extras: { delivery: number | null; discount: number | null }) => void;
}

export function CheckStockList({
  rows,
  onRowsChange,
  supplier,
  unreadable = [],
  showExtras,
  delivery: readDelivery,
  discount: readDiscount,
  canRestock,
  canRecordExpense,
  defaultRecordExpense,
  saving,
  onBack,
  onSave,
}: CheckStockListProps) {
  const [recordExpense, setRecordExpense] = useState(defaultRecordExpense && canRecordExpense);
  const [delivery, setDelivery] = useState(readDelivery ? String(readDelivery) : '');
  const [discount, setDiscount] = useState(readDiscount ? String(readDiscount) : '');

  const update = (key: string, patch: Partial<CheckRow>) =>
    onRowsChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: string) => onRowsChange(rows.filter((r) => r.key !== key));

  const problems = useMemo(
    () =>
      rows.map((r) => {
        if (r.choice === 'undecided') return 'Answer "Did you mean…?" first';
        if (r.choice === 'existing' && !canRestock) return 'Ask your employer to add to existing stock';
        if (!r.name.trim()) return 'Enter a name';
        if (!positive(r.quantity) || !Number.isInteger(positive(r.quantity))) return 'Enter how many';
        return null;
      }),
    [rows, canRestock]
  );
  const ready = rows.length > 0 && problems.every((p) => !p);
  const itemsCost = rows.reduce((sum, r) => sum + (r.free ? 0 : (positive(r.unitCost) ?? 0) * (positive(r.quantity) ?? 0)), 0);
  // Delivery and discount only count when there are costs to spread them over.
  const extrasOn = showExtras && itemsCost > 0;
  const deliveryAmount = extrasOn ? positive(delivery) : null;
  const discountAmount = extrasOn ? positive(discount) : null;
  const totalCost = Math.max(0, itemsCost + (deliveryAmount ?? 0) - (discountAmount ?? 0));
  const newCount = rows.filter((r) => r.choice === 'new').length;
  const restockCount = rows.filter((r) => r.choice === 'existing').length;

  const save = () =>
    onSave(
      rows.map((r) => ({
        name: r.choice === 'existing' ? r.item!.name : r.name.trim(),
        quantity: Math.round(positive(r.quantity)!),
        unit_cost: r.free ? null : positive(r.unitCost),
        selling_price: r.choice === 'new' ? positive(r.sellingPrice) : null,
        barcode: r.barcode || null,
        item_id: r.choice === 'existing' ? r.item!.id : null,
        original_name: r.choice === 'existing' && r.original !== r.item!.name ? r.original : null,
        ...(r.free ? { free: true } : {}),
      })),
      recordExpense,
      { delivery: deliveryAmount, discount: discountAmount }
    );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-medium">Check these items</p>
        <p className="text-sm text-muted-foreground">
          {supplier ? `From ${supplier}. ` : ''}Fix anything Misa read wrong. Nothing is saved until you press Add.
        </p>
      </div>

      {rows.length === 0 && (
        <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          No items found. Try a clearer photo, or type the list instead.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <li key={r.key} className={cn('rounded-lg border p-3', problems[i] ? 'border-amber-500/60' : 'border-border')}>
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                {r.choice === 'existing' ? (
                  <p className="text-sm">
                    <span className="font-medium">{r.item!.name}</span>
                    <span className="text-muted-foreground">{` · adds to your ${r.item!.stock} in stock`}</span>
                  </p>
                ) : (
                  <Input
                    aria-label="Item name"
                    value={r.name}
                    onChange={(e) => update(r.key, { name: e.target.value })}
                    placeholder="Item name"
                  />
                )}

                {r.choice === 'undecided' && (
                  <div className="space-y-2 rounded-md bg-muted/50 p-2 text-sm">
                    <p>{`"${r.original}": did you mean…`}</p>
                    <div className="flex flex-wrap gap-2">
                      {r.match.suggestions?.map((s) => (
                        <Button
                          key={s.id}
                          size="sm"
                          variant="outline"
                          onClick={() => update(r.key, { choice: 'existing', item: s, name: s.name })}
                        >
                          {s.name}
                        </Button>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => update(r.key, { choice: 'new' })}>
                        No, it&apos;s new
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <label className="space-y-1 text-xs text-muted-foreground">
                    How many
                    <Input
                      inputMode="numeric"
                      value={r.quantity}
                      onChange={(e) => update(r.key, { quantity: e.target.value })}
                      placeholder="0"
                    />
                  </label>
                  {r.free ? (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      Cost each
                      <p className="flex h-9 items-center text-sm text-foreground">Free</p>
                    </div>
                  ) : (
                    <label className="space-y-1 text-xs text-muted-foreground">
                      Cost each
                      <Input
                        inputMode="decimal"
                        value={r.unitCost}
                        onChange={(e) => update(r.key, { unitCost: e.target.value })}
                        placeholder="₦"
                      />
                    </label>
                  )}
                  {r.choice === 'new' && (
                    <label className="space-y-1 text-xs text-muted-foreground">
                      Sell for
                      <Input
                        inputMode="decimal"
                        value={r.sellingPrice}
                        onChange={(e) => update(r.key, { sellingPrice: e.target.value })}
                        placeholder="₦"
                      />
                    </label>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {r.choice === 'new' && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">New item</span>}
                  {r.free && (
                    <button type="button" className="text-muted-foreground underline" onClick={() => update(r.key, { free: false })}>
                      Not free? Add the cost
                    </button>
                  )}
                  {r.choice === 'existing' && (
                    <button type="button" className="text-muted-foreground underline" onClick={() => update(r.key, { choice: 'new', name: r.original })}>
                      Not this item? Make it new
                    </button>
                  )}
                  {r.barcode && <span className="text-muted-foreground">{`Barcode ${r.barcode}`}</span>}
                  {problems[i] && <span className="text-amber-500">{problems[i]}</span>}
                </div>
              </div>
              <Button size="icon" variant="ghost" aria-label={`Remove ${r.name || 'item'}`} onClick={() => remove(r.key)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {unreadable.length > 0 && (
        <div className="rounded-lg border border-border p-3 text-sm">
          <p className="font-medium">Misa couldn&apos;t read these lines</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {unreadable.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-muted-foreground">Go back and write them like &quot;Indomie 20&quot;.</p>
        </div>
      )}

      {extrasOn && (
        <div className="space-y-2 rounded-lg border border-border p-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-muted-foreground">
              Delivery
              <Input inputMode="decimal" value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder="₦" />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              Discount
              <Input inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="₦" />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            {deliveryAmount || discountAmount
              ? 'Shared across these items, so their cost is right.'
              : 'Paid for delivery or loading? Add it here.'}
          </p>
        </div>
      )}

      {canRecordExpense && totalCost > 0 && (
        <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
            checked={recordExpense}
            onChange={(e) => setRecordExpense(e.target.checked)}
          />
          <span>
            <span className="block">{`Record what I paid: ${formatCurrency(totalCost)}`}</span>
            <span className="block text-xs text-muted-foreground">Saved as expenses, one per item, so your profit stays right.</span>
          </span>
        </label>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={saving}>
          Back
        </Button>
        <Button className="flex-1" onClick={save} disabled={!ready || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {saving
            ? 'Adding...'
            : newCount && restockCount
              ? `Add ${newCount} new, restock ${restockCount}`
              : newCount
                ? `Add ${newCount} new`
                : restockCount
                  ? `Restock ${restockCount}`
                  : 'Add items'}
        </Button>
      </div>
    </div>
  );
}
