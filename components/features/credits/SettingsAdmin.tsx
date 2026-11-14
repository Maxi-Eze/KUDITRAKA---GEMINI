'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminSettings, useSaveAdminSettings } from '@/hooks/useCredits';
import type { CreditSettings } from '@/lib/api/credits';

/** One editable number: where it lives in the settings, and how it is labelled. */
interface Field {
  key: string;
  label: string;
  hint?: string;
  get: (s: CreditSettings) => number | undefined;
  set: (v: number) => Partial<CreditSettings>;
}

const p = (k: string, label: string): Field => ({
  key: `pricing.${k}`,
  label,
  get: (s) => s.pricing[k],
  set: (v) => ({ pricing: { [k]: v } as any }),
});

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: 'Prices (credits)',
    fields: [
      p('record_sale', 'Record a sale'),
      p('record_expense', 'Record an expense'),
      p('record_restock', 'Record a restock'),
      p('business_analytics', 'A report question'),
      p('settings_update', 'A settings change in chat'),
      {
        key: 'ai.standard',
        label: 'A bigger AI request',
        get: (s) => s.variablePricing.complex_ai_operation.standard,
        set: (v) => ({ variablePricing: { complex_ai_operation: { standard: v } } as any }),
      },
      {
        key: 'ai.voice',
        label: 'A voice note or multi-step request',
        get: (s) => s.variablePricing.complex_ai_operation.voice_or_multi_agent,
        set: (v) => ({ variablePricing: { complex_ai_operation: { voice_or_multi_agent: v } } as any }),
      },
      {
        key: 'receipt.image',
        label: 'Reading a receipt photo',
        get: (s) => s.variablePricing.receipt_extraction.image,
        set: (v) => ({ variablePricing: { receipt_extraction: { image: v } } as any }),
      },
      {
        key: 'receipt.pdf',
        label: 'Reading a PDF',
        get: (s) => s.variablePricing.receipt_extraction.pdf_document,
        set: (v) => ({ variablePricing: { receipt_extraction: { pdf_document: v } } as any }),
      },
    ],
  },
  {
    title: 'Top-ups',
    fields: [
      {
        key: 'fees.service',
        label: 'Our service charge (₦)',
        hint: 'Added to every top-up; comes to us.',
        get: (s) => s.topUpFees.serviceCharge,
        set: (v) => ({ topUpFees: { serviceCharge: v } as any }),
      },
      {
        key: 'fees.percent',
        label: 'Paystack fee (%)',
        hint: 'Set to what Paystack really takes.',
        get: (s) => s.topUpFees.percent,
        set: (v) => ({ topUpFees: { percent: v } as any }),
      },
      {
        key: 'fees.flat',
        label: 'Paystack flat fee (₦)',
        get: (s) => s.topUpFees.flat,
        set: (v) => ({ topUpFees: { flat: v } as any }),
      },
      {
        key: 'fees.waived',
        label: 'No flat fee below (₦)',
        get: (s) => s.topUpFees.flatWaivedBelow,
        set: (v) => ({ topUpFees: { flatWaivedBelow: v } as any }),
      },
      {
        key: 'fees.cap',
        label: 'Paystack fee cap (₦)',
        get: (s) => s.topUpFees.cap,
        set: (v) => ({ topUpFees: { cap: v } as any }),
      },
    ],
  },
  {
    title: 'Rules',
    fields: [
      { key: 'welcome', label: 'Free credits for new businesses', get: (s) => s.welcomeBonus, set: (v) => ({ welcomeBonus: v }) },
      { key: 'low', label: 'Warn when credits drop below', get: (s) => s.lowBalanceWarnAt, set: (v) => ({ lowBalanceWarnAt: v }) },
      { key: 'ask', label: 'Ask first when one action costs', get: (s) => s.askAboveCredits, set: (v) => ({ askAboveCredits: v }) },
      {
        key: 'grace',
        label: 'Records saved on credit at 0',
        get: (s) => s.graceRecords,
        set: (v) => ({ graceRecords: v }),
      },
      {
        key: 'paidExpiry',
        label: 'Paid credits last (months)',
        get: (s) => s.paidExpiryMonths,
        set: (v) => ({ paidExpiryMonths: v }),
      },
      {
        key: 'freeExpiry',
        label: 'Free credits last (days)',
        get: (s) => s.freeExpiryDays,
        set: (v) => ({ freeExpiryDays: v }),
      },
      {
        key: 'warnDays',
        label: 'Warn before expiry (days)',
        get: (s) => s.expiryWarnDays,
        set: (v) => ({ expiryWarnDays: v }),
      },
    ],
  },
];

/** Deep-merge the changed pieces so one save sends only what changed. */
const merge = (a: any, b: any): any => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? merge(a?.[k] || {}, v) : v;
  }
  return out;
};

/**
 * Kuditraka team: switch charging on or off, and change prices and rules without a new release.
 * Only the numbers that were changed are sent.
 */
export function SettingsAdmin() {
  const settings = useAdminSettings(true);
  const save = useSaveAdminSettings();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [confirmMode, setConfirmMode] = useState<null | 'active' | 'shadow'>(null);

  useEffect(() => setEdits({}), [settings.data]);

  if (settings.isLoading || !settings.data) return <Skeleton className="h-64 w-full" />;
  const s = settings.data;
  const on = s.mode === 'active';

  const fields = GROUPS.flatMap((g) => g.fields);
  const changed = fields.filter((f) => edits[f.key] !== undefined && Number(edits[f.key]) !== f.get(s));
  const invalid = changed.some((f) => edits[f.key].trim() === '' || !(Number(edits[f.key]) >= 0));

  const saveNumbers = () => {
    const body = changed.reduce((acc, f) => merge(acc, f.set(Number(edits[f.key]))), {} as Partial<CreditSettings>);
    save.mutate(body, { onSuccess: () => toast.success('Saved') });
  };

  const switchMode = (mode: 'active' | 'shadow') =>
    save.mutate({ mode }, {
      onSuccess: () => toast.success(mode === 'active' ? 'Charging is on' : 'Charging is off'),
      onSettled: () => setConfirmMode(null),
    });

  return (
    <div className="space-y-5">
      <section className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
        <div>
          <p className="font-medium">Charging</p>
          <p className="text-xs text-muted-foreground">
            {on ? 'On: credits are used, and traders see their credits.' : 'Off: nothing is taken and traders see no credits.'}
          </p>
        </div>
        <Switch checked={on} onCheckedChange={(next) => setConfirmMode(next ? 'active' : 'shadow')} />
      </section>

      {GROUPS.map((g) => (
        <section key={g.title} className="space-y-2">
          <p className="text-sm font-semibold">{g.title}</p>
          <div className="divide-y divide-border rounded-xl border border-border">
            {g.fields.map((f) => (
              <label key={f.key} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="min-w-0 text-sm">
                  {f.label}
                  {f.hint && <span className="block text-xs text-muted-foreground">{f.hint}</span>}
                </span>
                <Input
                  inputMode="decimal"
                  className="w-24 shrink-0 text-right"
                  value={edits[f.key] ?? String(f.get(s) ?? '')}
                  onChange={(e) => setEdits((x) => ({ ...x, [f.key]: e.target.value }))}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <Button className="h-11 w-full" disabled={!changed.length || invalid || save.isPending} onClick={saveNumbers}>
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : changed.length ? `Save ${changed.length} change${changed.length === 1 ? '' : 's'}` : 'No changes'}
      </Button>

      <Dialog open={!!confirmMode} onOpenChange={(o) => !o && setConfirmMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmMode === 'active' ? 'Switch charging on?' : 'Switch charging off?'}</DialogTitle>
            <DialogDescription>
              {confirmMode === 'active'
                ? 'Every business starts using credits now, and the expiry clocks start. Traders see their credits in the app and on WhatsApp.'
                : 'Nothing will be taken any more and traders will not see credits. Balances stay as they are.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmMode(null)}>
              Cancel
            </Button>
            <Button disabled={save.isPending} onClick={() => confirmMode && switchMode(confirmMode)}>
              {confirmMode === 'active' ? 'Switch on' : 'Switch off'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
