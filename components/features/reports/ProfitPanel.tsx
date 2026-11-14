'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProfit } from '@/hooks/useReports';
import { cn, formatCurrency } from '@/lib/utils';
import type { ItemProfit, ProfitPeriod, ProfitReport } from '@/lib/api/reports';

const PERIODS: { value: ProfitPeriod; label: string }[] = [
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
];

const hasSales = (p?: ProfitReport) => !!p && p.goods_sales + p.other_income > 0;

/** The lines under the profit figure: stock, running costs, what is missing. Shared by both views. */
function ProfitFacts({ profit }: { profit: ProfitReport }) {
  const missing = [...profit.no_cost_price.items, ...profit.cost_unclear.items];
  return (
    <div className="space-y-1.5 text-sm">
      {profit.cost_coverage_percent < 100 && (
        <p className="text-muted-foreground">
          Counts {Math.floor(profit.cost_coverage_percent)}% of your sales. The rest has no cost price yet.
        </p>
      )}
      {profit.stock_bought > 0 && (
        <p>
          Put into stock: <span className="font-semibold">{formatCurrency(profit.stock_bought)}</span>
          <span className="text-muted-foreground"> (not a loss)</span>
        </p>
      )}
      <p>
        {profit.running_costs_recorded ? (
          <>
            Running costs: <span className="font-semibold">{formatCurrency(profit.running_costs)}</span>. After them, you
            keep <span className="font-semibold">{formatCurrency(profit.profit_after_running_costs)}</span>.
          </>
        ) : (
          <span className="text-muted-foreground">Running costs (rent, fuel, transport) not added.</span>
        )}
      </p>
      {missing.length > 0 && (
        <p>
          <span className="text-muted-foreground">No cost price yet: </span>
          {missing.slice(0, 4).join(', ')}
          {missing.length > 4 && ` and ${missing.length - 4} more`}.{' '}
          <Link href="/inventory" className="font-semibold text-primary hover:underline">
            Add cost prices
          </Link>
        </p>
      )}
    </div>
  );
}

function ItemLine({ item }: { item: ItemProfit }) {
  const losing = item.profit < 0;
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className="truncate">{item.item}</span>
      <span className={cn('shrink-0 font-semibold', losing ? 'text-red-500' : 'text-emerald-600')}>
        {losing ? `Loss ${formatCurrency(-item.profit)}` : formatCurrency(item.profit)}
      </span>
    </li>
  );
}

/** Dashboard: this month's real profit, best items and losing items (owners only). */
export function ProfitThisMonth() {
  const { data: profit, isLoading } = useProfit('this_month');
  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  // Server without it yet, or nothing sold this month: the money in − out cards already cover it.
  if (!profit || !hasSales(profit)) return null;

  const best = profit.items.filter((i) => i.profit > 0).slice(0, 3);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Your profit this month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className={cn('text-3xl font-bold', profit.profit_on_goods < 0 && 'text-red-500')}>
            {formatCurrency(profit.profit_on_goods)}
          </div>
          <p className="text-sm text-muted-foreground">What you sold, minus what those goods cost you.</p>
        </div>
        <ProfitFacts profit={profit} />
        {(best.length > 0 || profit.losing_items.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {best.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold">Making you the most money</p>
                <ul className="space-y-1 text-sm">
                  {best.map((i) => (
                    <ItemLine key={i.item} item={i} />
                  ))}
                </ul>
              </div>
            )}
            {profit.losing_items.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold text-red-500">Selling below cost</p>
                <ul className="space-y-1 text-sm">
                  {profit.losing_items.slice(0, 3).map((i) => (
                    <ItemLine key={i.item} item={i} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <Link href="/reports#profit-by-item" className="inline-block text-sm font-semibold text-primary hover:underline">
          See profit for every item
        </Link>
      </CardContent>
    </Card>
  );
}

/** Reports: profit for every item, by period (owners only). */
export function ProfitByItem() {
  const [period, setPeriod] = useState<ProfitPeriod>('this_month');
  const { data: profit, isLoading, isError } = useProfit(period);
  // Server without it yet: show nothing rather than a broken section.
  if (isError) return null;

  return (
    <Card id="profit-by-item" className="scroll-mt-20">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-2">
        <CardTitle className="text-base">Profit by item</CardTitle>
        <Select items={PERIODS} value={period} onValueChange={(v) => v && setPeriod(v as ProfitPeriod)}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !profit ? (
          <Skeleton className="h-32 w-full" />
        ) : !hasSales(profit) ? (
          <p className="text-sm text-muted-foreground">No sales recorded for this period.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <div>
                <span className="text-sm text-muted-foreground">Profit </span>
                <span className={cn('text-2xl font-bold', profit.profit_on_goods < 0 && 'text-red-500')}>
                  {formatCurrency(profit.profit_on_goods)}
                </span>
              </div>
              {profit.sales_with_cost > 0 && (
                <span className="text-sm text-muted-foreground">
                  You keep {Math.round(profit.margin_percent)}% of what you sell
                </span>
              )}
            </div>
            <ProfitFacts profit={profit} />
            {profit.items.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Sold for</TableHead>
                    <TableHead className="text-right">Cost you</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">You keep</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profit.items.map((i) => {
                    const losing = i.profit < 0;
                    return (
                      <TableRow key={i.item}>
                        <TableCell className="max-w-40 truncate font-medium">
                          {i.item}
                          <span className="block text-xs font-normal text-muted-foreground">{i.quantity} sold</span>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(i.sales)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(i.cost)}</TableCell>
                        <TableCell className={cn('text-right font-semibold', losing ? 'text-red-500' : 'text-emerald-600')}>
                          {formatCurrency(i.profit)}
                        </TableCell>
                        <TableCell className={cn('hidden text-right sm:table-cell', losing && 'text-red-500')}>
                          {Math.round(i.margin_percent)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
