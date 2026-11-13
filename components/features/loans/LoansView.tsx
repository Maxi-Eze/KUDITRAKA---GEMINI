'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLoanProgress } from '@/hooks/useLoans';
import {
  ACTIVE_DAYS_NEEDED,
  ACTIVE_MONTHS_NEEDED,
  COUNT_WEEKS_CHECKED,
  isReadyToAsk,
  nextStep,
  type LoanProgress,
} from '@/lib/loans';

/** One block per month needed, lit for each active month. */
export function MonthBlocks({ active }: { active: number }) {
  return (
    <div
      className="grid grid-cols-9 gap-1"
      role="img"
      aria-label={`${active} of ${ACTIVE_MONTHS_NEEDED} active months`}
    >
      {Array.from({ length: ACTIVE_MONTHS_NEEDED }, (_, i) => (
        <div key={i} className={cn('h-2 rounded-full', i < active ? 'bg-primary' : 'bg-muted')} />
      ))}
    </div>
  );
}

function Step({ done, title, detail }: { done: boolean; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
      {done ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      ) : (
        <span className="h-6 w-6 shrink-0 rounded-full border-2 border-muted-foreground/50" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function Steps({ progress: p }: { progress: LoanProgress }) {
  const months = p.activeMonths;
  return (
    <div className="space-y-2">
      <Step
        done={months !== null && months >= ACTIVE_MONTHS_NEEDED}
        title={`Stay active for ${ACTIVE_MONTHS_NEEDED} months`}
        detail={months === null ? `Use Misa well on ${ACTIVE_DAYS_NEEDED} days every month` : `${months} of ${ACTIVE_MONTHS_NEEDED} active months`}
      />
      {p.boughtThisMonth !== null && (
        <Step
          done={p.boughtThisMonth}
          title="Buy credits in the month"
          detail={p.boughtThisMonth ? 'Done for this month' : 'Needed for this month to count'}
        />
      )}
      <Step
        done={p.itemsTotal > 0 && p.itemsWithCost === p.itemsTotal}
        title="Add cost prices to your stock"
        detail={p.itemsTotal === 0 ? 'No stock items yet' : `${p.itemsWithCost} of ${p.itemsTotal} items`}
      />
      <Step
        done={p.countWeeks === COUNT_WEEKS_CHECKED}
        title="Count your stock every week"
        detail={`${p.countWeeks} of the last ${COUNT_WEEKS_CHECKED} weeks`}
      />
    </div>
  );
}

function GettingReady({ progress: p }: { progress: LoanProgress }) {
  const next = nextStep(p);
  return (
    <>
      <section className="space-y-2 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-2xl font-bold leading-tight">Business loans with no interest</h2>
        <p className="text-sm text-muted-foreground">We only take a share of the profit.</p>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Your progress</h2>
          <span className="text-xs text-muted-foreground">Active months</span>
        </div>
        {p.activeMonths !== null ? (
          <p className="text-3xl font-bold leading-none">
            {p.activeMonths} <span className="text-lg font-medium text-muted-foreground">of {ACTIVE_MONTHS_NEEDED}</span>
          </p>
        ) : (
          <p className="text-base font-medium">Your count of active months will show here soon.</p>
        )}
        <MonthBlocks active={p.activeMonths ?? 0} />
        <p className="text-sm text-muted-foreground">
          A month counts when you use Misa well on at least {ACTIVE_DAYS_NEEDED} days (recording your real sales on the day you make
          them){p.boughtThisMonth !== null ? ' and buy credits that month' : ''}.
        </p>
        <p className="text-sm">This month so far: {p.daysThisMonth} of {ACTIVE_DAYS_NEEDED} days</p>
      </section>

      <section className="space-y-3 rounded-2xl border border-primary bg-primary/10 p-5">
        <div>
          <h2 className="text-xs font-medium text-primary">Your next step</h2>
          <p className="mt-1 text-lg font-bold leading-snug">{next.title}</p>
        </div>
        <Button className="h-12 w-full" nativeButton={false} render={<Link href={next.href} />}>
          {next.action}
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">How to get ready</h2>
        <Steps progress={p} />
      </section>

      <p className="text-xs text-muted-foreground">Terms and conditions apply.</p>
    </>
  );
}

function CanAsk({ progress: p }: { progress: LoanProgress }) {
  return (
    <>
      <section className="space-y-3 rounded-2xl border border-primary bg-primary/10 p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-6 w-6" strokeWidth={3} />
        </span>
        <h2 className="text-2xl font-bold leading-tight">You can now ask for a loan</h2>
        <p className="text-sm">No interest. We only take a share of the profit.</p>
        <Button className="h-12 w-full" nativeButton={false} render={<a href="mailto:kuditraka.ai@gmail.com?subject=Misa%20Loans" />}>
          Ask for a loan
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">What you did</h2>
        <Steps progress={p} />
      </section>

      <p className="text-xs text-muted-foreground">Terms and conditions apply.</p>
    </>
  );
}

export function LoansView() {
  const { progress, isLoading } = useLoanProgress();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-xl space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      {isReadyToAsk(progress) ? <CanAsk progress={progress} /> : <GettingReady progress={progress} />}
    </div>
  );
}
