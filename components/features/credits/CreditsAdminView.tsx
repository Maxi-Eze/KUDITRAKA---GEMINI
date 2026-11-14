'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsCreditsAdmin } from '@/hooks/useCredits';
import { GiveCreditsView } from './GiveCreditsView';
import { PaymentsAdmin } from './PaymentsAdmin';
import { SettingsAdmin } from './SettingsAdmin';

const TABS = [
  { key: 'give', label: 'Give credits' },
  { key: 'payments', label: 'Payments' },
  { key: 'settings', label: 'Settings' },
] as const;

/** Kuditraka team only (the server checks ADMIN_EMAILS): gifts, top-ups, and credit settings. */
export function CreditsAdminView() {
  const isAdmin = useIsCreditsAdmin();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('give');

  if (!isAdmin) {
    return <p className="mx-auto max-w-2xl text-sm text-muted-foreground">This page is only for the Kuditraka team.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Credits admin</h1>
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-sm font-medium',
              tab === t.key ? 'bg-background shadow-sm' : 'text-muted-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'give' && <GiveCreditsView />}
      {tab === 'payments' && <PaymentsAdmin />}
      {tab === 'settings' && <SettingsAdmin />}
    </div>
  );
}
