'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Loader2, Merge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDuplicateItems, useMergeItems, useNotDuplicates } from '@/hooks/useInventory';
import { cn } from '@/lib/utils';
import type { DuplicatePair } from '@/lib/types';

/** "These look like the same item": shown to the owner on the Stock page when Misa spots look-alikes. */
export function DuplicateItemsCard() {
  const { data } = useDuplicateItems();
  const notSame = useNotDuplicates();
  const [open, setOpen] = useState(false);
  const [merging, setMerging] = useState<DuplicatePair | null>(null);
  const pairs = Array.isArray(data) ? data : [];
  if (!pairs.length) return null;

  return (
    <div className="rounded-lg border border-input p-3">
      <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => setOpen((o) => !o)}>
        <Merge className="h-5 w-5 shrink-0 text-primary" />
        <span className="flex-1">
          <span className="block text-sm font-medium">
            {pairs.length === 1 ? '2 items look like the same thing' : `${pairs.length} pairs of items look like the same thing`}
          </span>
          <span className="block text-xs text-muted-foreground">Merge them so sales and stock counts stay in one place.</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <ul className="mt-3 flex flex-col gap-2">
          {pairs.map((p) => (
            <li key={`${p.items[0].id}-${p.items[1].id}`} className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 p-2 text-sm">
              <span className="min-w-0 flex-1">
                {p.items.map((i, n) => (
                  <span key={i.id}>
                    {n > 0 && <span className="text-muted-foreground"> and </span>}
                    <span className="font-medium">{i.name}</span>
                    <span className="text-muted-foreground">{` (${i.stock})`}</span>
                  </span>
                ))}
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setMerging(p)}>
                  Merge
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={notSame.isPending}
                  onClick={() => notSame.mutate([p.items[0].id, p.items[1].id])}
                >
                  Not the same
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <MergeDialog pair={merging} onClose={() => setMerging(null)} />
    </div>
  );
}

function MergeDialog({ pair, onClose }: { pair: DuplicatePair | null; onClose: () => void }) {
  const merge = useMergeItems();
  // Keep the one with more stock unless the trader picks the other.
  const [keepId, setKeepId] = useState<string | null>(null);
  if (!pair) return null;
  const [a, b] = pair.items;
  const keep = pair.items.find((i) => i.id === keepId) ?? (b.stock > a.stock ? b : a);
  const other = keep.id === a.id ? b : a;

  const close = () => {
    setKeepId(null);
    onClose();
  };

  const confirm = () =>
    merge.mutate(
      { keepId: keep.id, mergeIds: [other.id] },
      {
        onSuccess: (result) => {
          toast.success(`Merged. ${result.item.name} now has ${result.item.stock} in stock.`);
          close();
        },
      }
    );

  return (
    <Dialog open={!!pair} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Merge into one item</DialogTitle>
          <DialogDescription>Which name should stay?</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {pair.items.map((i) => (
            <button
              key={i.id}
              type="button"
              aria-pressed={i.id === keep.id}
              onClick={() => setKeepId(i.id)}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3 text-left text-sm',
                i.id === keep.id ? 'border-primary bg-primary/10' : 'border-input hover:bg-muted'
              )}
            >
              <span className="font-medium">{i.name}</span>
              <span className="text-muted-foreground">{`${i.stock} in stock`}</span>
            </button>
          ))}
        </div>

        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>{`Stock adds up: ${keep.stock + other.stock} ${keep.name}.`}</li>
          <li>{`Past sales of ${other.name} move over too.`}</li>
          <li>{`When someone sells "${other.name}" later, Misa takes it off ${keep.name}.`}</li>
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={merge.isPending}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={merge.isPending}>
            {merge.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {`Merge into ${keep.name}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
