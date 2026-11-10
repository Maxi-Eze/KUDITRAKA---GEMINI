'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { useWeeklyCheckup } from '@/hooks/useReports';
import { Lightbulb } from 'lucide-react';

const dayMonth = (ymd: string, withMonth: boolean) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', ...(withMonth && { month: 'short' }) }).format(
    new Date(`${ymd}T12:00:00+01:00`)
  );

/** "2 – 8 Nov", or "26 Oct – 1 Nov" across months. */
const weekRange = (start: string, end: string) => `${dayMonth(start, start.slice(0, 7) !== end.slice(0, 7))} – ${dayMonth(end, true)}`;

function Change({ pct, goodWhenUp }: { pct: number | null; goodWhenUp: boolean }) {
  if (pct === null) return null;
  if (pct === 0) return <span className="text-xs text-muted-foreground">same as the week before</span>;
  const good = pct > 0 === goodWhenUp;
  return (
    <span className={cn('text-xs font-medium', good ? 'text-emerald-500' : 'text-red-500')}>
      {pct > 0 ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

/** Last week at a glance: the same numbers as Misa's Monday WhatsApp check-up. Hidden when there's nothing to show. */
export function YourWeek() {
  const { data } = useWeeklyCheckup();
  if (!data?.hasActivity) return null;
  const w = data.week;
  const p = w.profit;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Your week ({weekRange(w.start_date, w.end_date)})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-x-8 sm:grid-cols-2">
          <div className="divide-y divide-border">
            <Row label="Sales">
              {formatCurrency(w.sales)} <Change pct={w.sales_change_pct} goodWhenUp />
            </Row>
            {p ? (
              <>
                <Row label="Profit">
                  <span className={cn(p.profit_on_goods < 0 && 'text-red-500')}>{formatCurrency(p.profit_on_goods)}</span>
                  {p.cost_coverage_percent < 100 && (
                    <span className="block text-xs font-normal text-muted-foreground">
                      counts {Math.floor(p.cost_coverage_percent)}% of sales
                    </span>
                  )}
                </Row>
                {p.stock_bought > 0 && <Row label="Put into stock">{formatCurrency(p.stock_bought)}</Row>}
                {p.running_costs > 0 && <Row label="Running costs">{formatCurrency(p.running_costs)}</Row>}
              </>
            ) : (
              <>
                <Row label="Spent">
                  {formatCurrency(w.spent)} <Change pct={w.spent_change_pct} goodWhenUp={false} />
                </Row>
                <Row label="Sales minus spending">{formatCurrency(w.sales_minus_spending)}</Row>
              </>
            )}
          </div>
          <div className="divide-y divide-border">
            {p && p.best_items.length > 0 ? (
              <Row label="Best">{p.best_items.map((i) => `${i.item} ${formatCurrency(i.profit)}`).join(', ')}</Row>
            ) : (
              w.top_item && <Row label="Sold most">{`${w.top_item.name} (${w.top_item.quantity.toLocaleString()})`}</Row>
            )}
            {p && p.losing_items.length > 0 && (
              <Row label="Selling below cost">
                <span className="text-red-500">
                  {p.losing_items
                    .slice(0, 3)
                    .map((i) => `${i.item} (loss ${formatCurrency(i.loss)})`)
                    .join(', ')}
                </span>
              </Row>
            )}
            {w.best_day && <Row label="Best day">{`${w.best_day.weekday} (${formatCurrency(w.best_day.sales)})`}</Row>}
            {w.debtor_count > 0 && (
              <Row label="Customers owe you">
                {formatCurrency(w.owed_total)} ({w.debtor_count} {w.debtor_count === 1 ? 'person' : 'people'})
                {w.late_count > 0 && <span className="text-amber-500">, {w.late_count} late</span>}
              </Row>
            )}
            {w.running_low.length > 0 && <Row label="Running low">{w.running_low.join(', ')}</Row>}
          </div>
        </div>

        {w.tip && (
          <div className="mt-4 flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>{w.tip}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
