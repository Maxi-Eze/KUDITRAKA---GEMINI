'use client';

import Link from 'next/link';
import { Check, ChevronRight, Lock } from 'lucide-react';
import { useLoanProgress } from '@/hooks/useLoans';
import { ACTIVE_MONTHS_NEEDED, isReadyToAsk } from '@/lib/loans';

/** The way into Misa Loans from Home (owners only): one short line. */
export function LoansCard() {
  const { progress } = useLoanProgress();
  const ready = isReadyToAsk(progress);

  return (
    <Link
      href="/loans"
      className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
    >
      {ready ? <Check className="h-4 w-4 shrink-0 text-primary" /> : <Lock className="h-4 w-4 shrink-0 text-primary" />}
      <span className="min-w-0 truncate">
        <span className="font-semibold">Misa Loans</span>
        {ready
          ? ': you can now ask for a loan'
          : progress.activeMonths !== null
            ? `: ${progress.activeMonths} of ${ACTIVE_MONTHS_NEEDED} months`
            : ': no interest, a share of profit'}
      </span>
      <span className="ml-auto flex shrink-0 items-center font-semibold text-primary">
        {ready ? 'Ask' : 'Progress'}
        <ChevronRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
