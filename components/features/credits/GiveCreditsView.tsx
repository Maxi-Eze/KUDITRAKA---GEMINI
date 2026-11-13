'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAdminBusinesses, useGiveCredits } from '@/hooks/useCredits';
import { formatCredits } from '@/lib/credits';
import type { BusinessCredits } from '@/lib/api/credits';

/**
 * Kuditraka staff only (the server checks ADMIN_EMAILS): give a business free credits, with a
 * reason. Every gift is recorded with who gave it. The owner gets a WhatsApp message unless
 * "Tell them on WhatsApp" is off (for quietly fixing a mistake).
 */
export function GiveCreditsView() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<BusinessCredits | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(true);
  const list = useAdminBusinesses(search, true);
  const give = useGiveCredits();

  // Search after the typing stops for a moment.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const credits = Math.round(Number(amount.replace(/[^\d]/g, '')) || 0);
  const canGive = !!picked && credits > 0 && reason.trim().length >= 3 && !give.isPending;

  const submit = () => {
    if (!picked) return;
    give.mutate(
      { businessId: picked.business_id, amount: credits, reason: reason.trim(), notify },
      {
        onSuccess: () => {
          toast.success(`${formatCredits(credits)} given to ${picked.business_name || picked.owner_name || 'the business'}`);
          setAmount('');
          setReason('');
          setPicked((p) => (p ? { ...p, balance: p.balance + credits } : p));
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Free credits for a business. Each gift is recorded with your name and the reason.</p>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-medium">1. Find the business</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Business name, owner, email or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {list.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-xl border border-border">
            {(list.data?.businesses ?? []).map((b) => (
              <li key={b.business_id}>
                <button
                  type="button"
                  onClick={() => setPicked(b)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm',
                    picked?.business_id === b.business_id ? 'bg-primary/10' : 'hover:bg-muted',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{b.business_name || b.owner_name || 'No name'}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[b.owner_name, b.phone || b.email].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatCredits(b.balance)}</span>
                </button>
              </li>
            ))}
            {list.data && list.data.businesses.length === 0 && (
              <li className="px-3 py-4 text-sm text-muted-foreground">No business found.</li>
            )}
          </ul>
        )}
      </section>

      <section className={cn('space-y-3 rounded-2xl border border-border bg-card p-5', !picked && 'opacity-60')}>
        <p className="text-sm font-medium">
          2. {picked ? `Give credits to ${picked.business_name || picked.owner_name}` : 'Choose a business first'}
        </p>
        {picked && <p className="text-xs text-muted-foreground">They have {formatCredits(picked.balance)} now.</p>}
        <Input
          inputMode="numeric"
          placeholder="How many credits, e.g. 500"
          value={amount}
          disabled={!picked}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          placeholder="Reason, e.g. Thank you for testing"
          value={reason}
          disabled={!picked}
          onChange={(e) => setReason(e.target.value)}
        />
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>
            Tell them on WhatsApp
            <span className="block text-xs text-muted-foreground">Turn off to quietly fix a mistake.</span>
          </span>
          <Switch checked={notify} onCheckedChange={setNotify} disabled={!picked} />
        </label>
        <Button className="h-11 w-full" disabled={!canGive} onClick={submit}>
          {give.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : credits > 0 ? `Give ${formatCredits(credits)}` : 'Give credits'}
        </Button>
      </section>
    </div>
  );
}
