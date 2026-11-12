'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { creditsApi, type TopUpAccount } from '@/lib/api/credits';
import { useRefreshCredits, useStartTopUp, useTopUpQuote } from '@/hooks/useCredits';
import { formatCredits, formatNaira, MAX_TOP_UP, MIN_TOP_UP, timeLeft, TOP_UP_PRESETS } from '@/lib/credits';

interface TopUpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Add credits: choose how many, see the one price ("includes payment fees"), then get a one-time
 * bank account for exactly that amount. Paystack only accepts the exact amount, so it is easy to
 * copy. Credits arrive by themselves once the money lands; we also check every few seconds.
 */
export function TopUpSheet({ open, onOpenChange }: TopUpSheetProps) {
  const [credits, setCredits] = useState(2000);
  const [custom, setCustom] = useState('');
  const [account, setAccount] = useState<TopUpAccount | null>(null);
  const [paid, setPaid] = useState<number | null>(null);

  const reset = () => {
    setAccount(null);
    setPaid(null);
    setCustom('');
    setCredits(2000);
  };
  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add credits</SheetTitle>
          <SheetDescription>1 credit = ₦1. Pay by bank transfer from any bank app.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {paid !== null ? (
            <Paid credits={paid} onDone={() => close(false)} />
          ) : account ? (
            <PayToAccount account={account} onPaid={setPaid} onExpired={() => setAccount(null)} />
          ) : (
            <ChooseAmount
              credits={credits}
              custom={custom}
              onPreset={(n) => {
                setCredits(n);
                setCustom('');
              }}
              onCustom={(v) => {
                setCustom(v);
                setCredits(Number(v.replace(/[^\d]/g, '')) || 0);
              }}
              onAccount={setAccount}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ChooseAmount({
  credits,
  custom,
  onPreset,
  onCustom,
  onAccount,
}: {
  credits: number;
  custom: string;
  onPreset: (n: number) => void;
  onCustom: (v: string) => void;
  onAccount: (a: TopUpAccount) => void;
}) {
  const valid = credits >= MIN_TOP_UP && credits <= MAX_TOP_UP;
  const { data: quote, isFetching } = useTopUpQuote(valid ? credits : 0);
  const start = useStartTopUp();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium">How many credits?</p>
        <div className="grid grid-cols-2 gap-2">
          {TOP_UP_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPreset(n)}
              className={cn(
                'rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors',
                !custom && credits === n ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted',
              )}
            >
              {formatCredits(n)}
            </button>
          ))}
        </div>
        <Input
          inputMode="numeric"
          placeholder="Or type another amount"
          value={custom}
          onChange={(e) => onCustom(e.target.value)}
          aria-label="Number of credits"
        />
        {custom && !valid && (
          <p className="text-xs text-destructive">
            Choose between {formatCredits(MIN_TOP_UP)} and {formatCredits(MAX_TOP_UP)}.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">You pay</p>
        <p className="text-2xl font-bold">
          {valid && quote ? formatNaira(quote.total) : valid && isFetching ? '…' : '—'}
        </p>
        <p className="text-xs text-muted-foreground">Includes payment fees.</p>
        {valid && quote && (
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            {formatNaira(quote.credits)} for credits + {formatNaira(quote.payment_fee + quote.service_charge)} payment fees.
          </p>
        )}
      </div>

      <Button
        className="h-11 w-full"
        disabled={!valid || !quote || start.isPending}
        onClick={() => start.mutate(credits, { onSuccess: onAccount })}
      >
        {start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get bank account'}
      </Button>
    </div>
  );
}

function CopyRow({ label, value, shown }: { label: string; value: string; shown?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy. Please copy it by hand.');
    }
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold tracking-wide">{shown ?? value}</p>
      </div>
      <Button variant="outline" size="sm" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

function PayToAccount({
  account,
  onPaid,
  onExpired,
}: {
  account: TopUpAccount;
  onPaid: (credits: number) => void;
  onExpired: () => void;
}) {
  const refresh = useRefreshCredits();
  const [now, setNow] = useState(() => Date.now());
  const [checking, setChecking] = useState(false);
  const left = timeLeft(account.expiresAt, now);
  const bank = account.bankName || 'Paystack-Titan';

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const check = async (quiet: boolean) => {
    if (!quiet) setChecking(true);
    try {
      const res = await creditsApi.checkPayment(account.reference);
      if (res.status === 'successful') {
        refresh();
        onPaid(res.credits);
      } else if (!quiet) {
        toast.message("We haven't seen your transfer yet. It usually shows within 1–2 minutes.");
      }
    } catch (e) {
      if (!quiet) toast.error(e instanceof Error ? e.message : 'Could not check the payment');
    } finally {
      if (!quiet) setChecking(false);
    }
  };

  // Credits are added by themselves when the money lands; check quietly every 15 seconds too.
  useEffect(() => {
    const t = setInterval(() => check(true), 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.reference]);

  if (account.expiresAt && !left) {
    return (
      <div className="space-y-4">
        <p className="text-sm">This account has expired. If you already sent the money, it will still be added once it lands.</p>
        <Button className="w-full" variant="outline" onClick={onExpired}>
          Get a new account
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">Transfer exactly {formatNaira(account.amount)}</p>
        <p className="text-xs text-muted-foreground">
          For {formatCredits(account.credits)} (includes payment fees). The bank only accepts this exact amount.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-xs text-muted-foreground">Bank</p>
          <p className="text-lg font-semibold">{bank}</p>
        </div>
        {account.accountNumber && <CopyRow label="Account number" value={account.accountNumber} />}
        <CopyRow label="Amount" value={String(Math.round(account.amount))} shown={formatNaira(account.amount)} />
        {account.accountName && (
          <div>
            <p className="text-xs text-muted-foreground">Account name</p>
            <p className="text-sm font-medium">{account.accountName}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        In your bank app, search for <span className="font-medium text-foreground">{bank}</span>
        {/titan/i.test(bank) ? ' (or Titan-Paystack)' : ''}. This account is for this payment only
        {left ? (
          <>
            {' '}
            and expires in <span className="font-medium text-foreground">{left}</span>
          </>
        ) : null}
        .
      </p>

      <Button className="h-11 w-full" variant="outline" disabled={checking} onClick={() => check(false)}>
        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "I've sent the money"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">Your credits are added by themselves once the money lands.</p>
    </div>
  );
}

function Paid({ credits, onDone }: { credits: number; onDone: () => void }) {
  return (
    <div className="space-y-4 py-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-6 w-6" strokeWidth={3} />
      </div>
      <div>
        <p className="text-lg font-semibold">Payment received</p>
        <p className="text-sm text-muted-foreground">{formatCredits(credits)} added.</p>
      </div>
      <Button className="w-full" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
