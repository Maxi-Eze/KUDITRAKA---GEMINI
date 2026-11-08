'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import { useInventoryItems, useStockCounts } from './useInventory';
import { queryKeys } from './keys';
import { daysRecordedThisMonth, itemsWithCostPrice, weeksWithCount, type LoanProgress } from '@/lib/loans';

/** On this computer only: /loans?demo=getting or ?demo=ready shows sample numbers, to review the screens. */
const DEMO: Record<string, LoanProgress> = {
  getting: { activeMonths: 4, daysThisMonth: 11, itemsTotal: 30, itemsWithCost: 12, countWeeks: 2 },
  ready: { activeMonths: 9, daysThisMonth: 24, itemsTotal: 30, itemsWithCost: 30, countWeeks: 4 },
};

export function useLoanProgress(): { progress: LoanProgress; isLoading: boolean } {
  const [demo, setDemo] = useState<LoanProgress | null>(null);
  const items = useInventoryItems();
  const counts = useStockCounts();
  const days = useQuery({
    queryKey: queryKeys.reports.dailyActivity(),
    queryFn: reportsApi.getDailyActivity,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const name = new URLSearchParams(window.location.search).get('demo');
    if (name && DEMO[name]) setDemo(DEMO[name]);
  }, []);

  if (demo) return { progress: demo, isLoading: false };

  const list = Array.isArray(items.data) ? items.data : [];
  return {
    isLoading: items.isLoading || counts.isLoading || days.isLoading,
    progress: {
      // Counting whole months needs a small server part; until then the screen says so.
      activeMonths: null,
      daysThisMonth: daysRecordedThisMonth(days.data?.timeline ?? []),
      itemsTotal: list.length,
      itemsWithCost: itemsWithCostPrice(list),
      countWeeks: weeksWithCount(Array.isArray(counts.data) ? counts.data : []),
    },
  };
}
