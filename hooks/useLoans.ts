'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import { useInventoryItems, useStockCounts } from './useInventory';
import { queryKeys } from './keys';
import { daysRecordedThisMonth, itemsWithCostPrice, weeksWithCount, type LoanProgress } from '@/lib/loans';

/** On this computer only: /loans?demo=getting or ?demo=ready shows sample numbers, to review the screens. */
const DEMO: Record<string, LoanProgress> = {
  getting: { activeMonths: 4, daysThisMonth: 11, boughtThisMonth: false, itemsTotal: 30, itemsWithCost: 12, countWeeks: 2 },
  ready: { activeMonths: 9, daysThisMonth: 24, boughtThisMonth: true, itemsTotal: 30, itemsWithCost: 30, countWeeks: 4 },
};

export function useLoanProgress(): { progress: LoanProgress; isLoading: boolean } {
  const [demo, setDemo] = useState<LoanProgress | null>(null);
  const items = useInventoryItems();
  const counts = useStockCounts();
  const days = useQuery({
    queryKey: queryKeys.reports.dailyActivity(),
    queryFn: reportsApi.getDailyActivity,
  });
  // Fails quietly until the server has it; the screen then says the count is coming.
  const server = useQuery({
    queryKey: queryKeys.reports.loanProgress(),
    queryFn: reportsApi.getLoanProgress,
    retry: false,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const name = new URLSearchParams(window.location.search).get('demo');
    if (name && DEMO[name]) setDemo(DEMO[name]);
  }, []);

  if (demo) return { progress: demo, isLoading: false };

  const list = Array.isArray(items.data) ? items.data : [];
  return {
    isLoading: items.isLoading || counts.isLoading || days.isLoading || server.isLoading,
    progress: {
      activeMonths: server.data?.active_months ?? null,
      daysThisMonth: server.data?.days_this_month ?? daysRecordedThisMonth(days.data?.timeline ?? []),
      boughtThisMonth: server.data?.bought_this_month ?? null,
      itemsTotal: list.length,
      itemsWithCost: itemsWithCostPrice(list),
      countWeeks: weeksWithCount(Array.isArray(counts.data) ? counts.data : []),
    },
  };
}
