'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCreditUsage } from '@/hooks/useCredits';
import { formatCredits, LOW_CREDITS } from '@/lib/credits';
import { TopUpSheet } from './TopUpSheet';

const PERIODS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
];

/** Owner's credits page, kept short: balance and Add credits, then where credits went (and who used them). */
export function CreditsView() {
  const [days, setDays] = useState(7);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const { data: usage, isLoading } = useCreditUsage(days);
  const balance = usage?.balance ?? 0;
  const low = !!usage && !usage.shadow && balance < LOW_CREDITS;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Your credits</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-9 w-40" />
        ) : (
          <p className={cn('text-3xl font-bold', low && 'text-amber-500')}>{formatCredits(balance)}</p>
        )}
        {usage?.expiring_soon && (
          <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
            {formatCredits(usage.expiring_soon.credits)} expire on{' '}
            {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Africa/Lagos' }).format(
              new Date(usage.expiring_soon.date),
            )}
            .
          </p>
        )}
        {usage && usage.on_credit.count > 0 && (
          <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
            {usage.on_credit.count} {usage.on_credit.count === 1 ? 'record was' : 'records were'} saved on credit (
            {formatCredits(usage.on_credit.credits)}). Your next top-up pays for {usage.on_credit.count === 1 ? 'it' : 'them'} first.
          </p>
        )}
        <Button className="mt-4 h-11 w-full sm:w-auto" onClick={() => setTopUpOpen(true)}>
          <Plus className="h-4 w-4" />
          Add credits
        </Button>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Where your credits went</h2>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setDays(p.days)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium',
                  days === p.days ? 'bg-background shadow-sm' : 'text-muted-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !usage || usage.used.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {usage?.shadow ? 'Charging has not started yet, so no credits have been used.' : 'No credits used in this time.'}
          </p>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {usage.used.map((u) => (
                <li key={u.operation} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {u.count} {u.label}
                  </span>
                  <span className="font-medium">{formatCredits(u.credits)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between py-2 text-sm font-semibold">
                <span>Total</span>
                <span>{formatCredits(usage.used_total)}</span>
              </li>
            </ul>

            {usage.by_person.some((p) => p.member_id) && (
              <div className="space-y-1 pt-2">
                <p className="text-sm font-medium">Who used them</p>
                <ul className="divide-y divide-border">
                  {usage.by_person.map((p) => (
                    <li key={p.member_id ?? 'owner'} className="flex items-center justify-between py-2 text-sm">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">
                        {p.count} · <span className="font-medium text-foreground">{formatCredits(p.credits)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <p className="pt-2 text-xs text-muted-foreground">
          Free: checking your credits, adding credits, help and the menu, greetings, and the reminders Misa sends you. Misa asks
          before anything big, like reading a receipt.
        </p>
      </section>

      <TopUpSheet open={topUpOpen} onOpenChange={setTopUpOpen} />
    </div>
  );
}
