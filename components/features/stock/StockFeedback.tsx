'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inventoryApi } from '@/lib/api/inventory';
import { queryKeys } from '@/hooks/keys';
import { shouldOfferTracking, stockNote } from '@/lib/stock';
import { cn } from '@/lib/utils';
import type { StockResult } from '@/lib/types';

/** One line about what a sale did to stock, e.g. "18 Rice left in stock." */
export function StockNoteLine({ stock, className }: { stock?: StockResult | null; className?: string }) {
  const note = stockNote(stock);
  if (!note) return null;
  const Icon = note.tone === 'warning' ? AlertTriangle : Package;
  return (
    <div className={cn('flex items-start gap-2 text-sm', note.tone === 'warning' ? 'text-amber-500' : 'text-muted-foreground', className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{note.text}</span>
    </div>
  );
}

/**
 * "Indomie isn't in your stock list. Track it?" — shown after saving a sale or purchase
 * of something that looks like stock but isn't tracked yet.
 */
export function TrackItemPrompt({ stock, onDone }: { stock?: StockResult | null; onDone?: () => void }) {
  const qc = useQueryClient();
  const [count, setCount] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!shouldOfferTracking(stock) || !stock) return null;
  const name = stock.item;

  if (result) {
    return (
      <div className="flex items-start gap-2 text-sm text-emerald-500">
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{result}</span>
      </div>
    );
  }

  const add = async () => {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 0) {
      setError('Enter how many you have now, e.g. 40');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const item = await inventoryApi.track({ name, stock: n, selling_price: stock.suggested_price ?? null });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      setResult(`Now tracking ${item.name}: ${item.stock} in stock.`);
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add it. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const ignore = async () => {
    setBusy(true);
    setError(null);
    try {
      await inventoryApi.ignore(name);
      setResult(`Okay, we won't ask about ${name} again.`);
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <p className="text-sm font-medium">{name} isn&apos;t in your stock list. Track it?</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="How many?"
          aria-label={`How many ${name} you have now`}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="h-9 w-32"
        />
        <Button size="sm" onClick={add} disabled={busy || count === ''}>
          Add to stock
        </Button>
      </div>
      <button type="button" onClick={ignore} disabled={busy} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
        Not a stock item
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
