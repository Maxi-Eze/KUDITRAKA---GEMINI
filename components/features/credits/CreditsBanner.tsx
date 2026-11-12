'use client';

import Link from 'next/link';
import { BatteryLow } from 'lucide-react';
import { useCreditsActive, useCreditUsage } from '@/hooks/useCredits';
import { formatCredits, LOW_CREDITS } from '@/lib/credits';

/**
 * A short note on the dashboard, only at a milestone: credits running low, or records saved on
 * credit after running out. Nothing at all otherwise, and nothing before charging is switched on.
 */
export function CreditsBanner() {
  const active = useCreditsActive();
  const { data: usage } = useCreditUsage(7);
  if (!active || !usage || usage.shadow) return null;

  const onCredit = usage.on_credit.count;
  if (onCredit === 0 && usage.balance >= LOW_CREDITS) return null;

  const text =
    onCredit > 0
      ? `You're out of credits. ${onCredit} ${onCredit === 1 ? 'record was' : 'records were'} still saved, and your next top-up pays for ${onCredit === 1 ? 'it' : 'them'}.`
      : `You have ${formatCredits(usage.balance)} left.`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <p className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
        <BatteryLow className="h-4 w-4 shrink-0" />
        {text}
      </p>
      <Link
        href="/credits"
        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Add credits
      </Link>
    </div>
  );
}
