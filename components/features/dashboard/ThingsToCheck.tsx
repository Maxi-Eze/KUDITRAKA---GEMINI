'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, HandCoins, Tags } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useShopAlerts } from '@/hooks/useReports';
import { formatCurrency } from '@/lib/utils';

const daysText = (d: number) => (d < 1 ? 'less than a day left' : `about ${d} day${d === 1 ? '' : 's'} left`);

const joinPrices = (prices: number[]) => {
  const list = prices.slice(0, 3).map((p) => formatCurrency(p));
  return list.length === 2 ? list.join(' and ') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
};

function Section({ icon: Icon, title, children }: { icon: typeof Clock; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="min-w-0 space-y-1 text-sm">
        <p className="font-semibold">{title}</p>
        {children}
      </div>
    </div>
  );
}

/** Owner's Dashboard: running out soon, money sleeping on the shelf, credit given, mixed prices (last 7 days). */
export function ThingsToCheck() {
  const { data: a } = useShopAlerts();
  if (!a) return null;

  const sleeping = a.sleeping_stock.items;
  const showCredit = a.credit.new_credit > 0;
  if (!a.running_out.length && !sleeping.length && !showCredit && !a.mixed_prices.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Things to check</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {a.running_out.length > 0 && (
          <Section icon={Clock} title="Running out soon">
            {a.running_out.slice(0, 4).map((r) => (
              <p key={r.name}>
                {r.name}: <span className="text-muted-foreground">{daysText(r.days_left)} at your pace</span>
              </p>
            ))}
          </Section>
        )}

        {sleeping.length > 0 && (
          <Section icon={AlertTriangle} title="Money sleeping on the shelf">
            <p>
              {a.sleeping_stock.total_value > 0 && (
                <span className="font-semibold">{formatCurrency(a.sleeping_stock.total_value)} </span>
              )}
              <span className="text-muted-foreground">
                {a.sleeping_stock.total_value > 0 ? 'of stock ' : 'Stock that '}hasn&apos;t sold in 3 weeks:{' '}
              </span>
              {sleeping
                .slice(0, 4)
                .map((i) => (i.value ? `${i.name} (${formatCurrency(i.value)})` : i.name))
                .join(', ')}
            </p>
            <p className="text-muted-foreground">A small discount or a bundle can free that money.</p>
          </Section>
        )}

        {showCredit && (
          <Section icon={HandCoins} title="Credit given">
            <p>
              You gave <span className="font-semibold">{formatCurrency(a.credit.new_credit)}</span> on credit in the last 7 days
              {a.credit.share_percent !== null && <span className="text-muted-foreground"> ({a.credit.share_percent}% of your sales)</span>}.
            </p>
            <p>
              Customers owe you {formatCurrency(a.credit.owed_total)}.{' '}
              <Link href="/debts" className="font-semibold text-primary hover:underline">
                See debts
              </Link>
            </p>
          </Section>
        )}

        {a.mixed_prices.length > 0 && (
          <Section icon={Tags} title="Same item, different prices">
            {a.mixed_prices.slice(0, 3).map((m) => (
              <p key={m.item}>
                {m.item} went for {joinPrices(m.prices)} each.
                {m.low_by && <span className="text-muted-foreground"> The lowest was recorded by {m.low_by}.</span>}
              </p>
            ))}
            <p className="text-muted-foreground">If these were discounts, agree one price so you don&apos;t lose money.</p>
          </Section>
        )}
      </CardContent>
    </Card>
  );
}
