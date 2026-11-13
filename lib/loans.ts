import type { AnalyticsTimelinePoint } from '@/lib/api/reports';
import type { InventoryItem, StockCount } from '@/lib/types';

/** Getting ready for Misa Loans. These are steps towards asking, not a promise of a loan. */
export const ACTIVE_MONTHS_NEEDED = 9;
export const ACTIVE_DAYS_NEEDED = 22;
export const COUNT_WEEKS_CHECKED = 4;

export interface LoanProgress {
  /** Months where Misa was used well on enough days. null until the server can count them. */
  activeMonths: number | null;
  daysThisMonth: number;
  /** Credits bought this month (each active month needs it). null until the server says. */
  boughtThisMonth: boolean | null;
  itemsTotal: number;
  itemsWithCost: number;
  countWeeks: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Days with a record this month, in Lagos time. */
export function daysRecordedThisMonth(timeline: AnalyticsTimelinePoint[], now: Date = new Date()): number {
  const month = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }).slice(0, 7);
  return timeline.filter((p) => p.transaction_count > 0 && p.period.slice(0, 7) === month).length;
}

/** How many of the last 4 weeks had at least one stock count. */
export function weeksWithCount(counts: StockCount[], now: Date = new Date()): number {
  let weeks = 0;
  for (let i = 0; i < COUNT_WEEKS_CHECKED; i++) {
    const end = now.getTime() - i * WEEK_MS;
    const start = end - WEEK_MS;
    if (counts.some((c) => {
      const at = new Date(c.created_at).getTime();
      return at > start && at <= end;
    })) weeks++;
  }
  return weeks;
}

export function itemsWithCostPrice(items: InventoryItem[]): number {
  return items.filter((i) => Number(i.cost_price) > 0).length;
}

/** All the steps done: the trader can ask for a loan. */
export function isReadyToAsk(p: LoanProgress): boolean {
  return (
    p.activeMonths !== null &&
    p.activeMonths >= ACTIVE_MONTHS_NEEDED &&
    p.itemsTotal > 0 &&
    p.itemsWithCost === p.itemsTotal &&
    p.countWeeks === COUNT_WEEKS_CHECKED
  );
}

/** The one thing to do next, in the order that moves the trader on fastest. */
export function nextStep(p: LoanProgress): { title: string; action: string; href: string } {
  if (p.itemsTotal === 0) return { title: 'Add your stock items', action: 'Add stock', href: '/inventory' };
  const missing = p.itemsTotal - p.itemsWithCost;
  if (missing > 0) {
    return { title: `Add cost prices to ${missing} more item${missing === 1 ? '' : 's'}`, action: 'Add cost prices', href: '/inventory' };
  }
  if (p.boughtThisMonth === false) return { title: 'Buy credits this month', action: 'Add credits', href: '/credits' };
  if (p.countWeeks < COUNT_WEEKS_CHECKED) return { title: 'Count your stock this week', action: 'Count stock', href: '/inventory' };
  return { title: "Record today's sales", action: 'Record a sale', href: '/chat' };
}
