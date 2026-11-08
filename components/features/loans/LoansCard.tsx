'use client';

import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { useLoanProgress } from '@/hooks/useLoans';
import { ACTIVE_MONTHS_NEEDED, isReadyToAsk } from '@/lib/loans';
import { MonthBlocks } from './LoansView';

/** The way into Misa Loans from the Dashboard (owners only). */
export function LoansCard() {
  const { progress } = useLoanProgress();
  const ready = isReadyToAsk(progress);

  return (
    <Link
      href="/loans"
      className="block space-y-3 rounded-2xl border border-primary bg-primary/10 p-5 transition-colors hover:bg-primary/15"
    >
      <div className="flex items-center gap-2.5">
        {ready ? <Check className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-primary" />}
        <span className="text-base font-bold">Misa Loans</span>
      </div>
      <p className="text-sm">Business loans with no interest. We only take a share of the profit.</p>
      {progress.activeMonths !== null && <MonthBlocks active={progress.activeMonths} />}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        {progress.activeMonths !== null && !ready && (
          <span className="font-medium">{progress.activeMonths} of {ACTIVE_MONTHS_NEEDED} active months</span>
        )}
        <span className="font-bold text-primary">
          {ready ? 'You can now ask for a loan' : progress.activeMonths !== null ? 'See your progress' : 'See how to get ready'}
        </span>
      </div>
    </Link>
  );
}
