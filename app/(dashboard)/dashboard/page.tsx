'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useSummary, useAnalytics, useProfit } from '@/hooks/useReports';
import { useUser } from '@/hooks/useAuth';
import { KpiCards } from '@/components/features/dashboard/KpiCards';
import { RecentTransactions } from '@/components/features/dashboard/RecentTransactions';
import { LoansCard } from '@/components/features/loans/LoansCard';
import { ThingsToCheck } from '@/components/features/dashboard/ThingsToCheck';
import { GetStarted } from '@/components/features/dashboard/GetStarted';
import { CreditsBanner } from '@/components/features/credits/CreditsBanner';
import { StaffHome } from '@/components/features/team/StaffHome';
import { isOwner, usesStaffHome } from '@/lib/permissions';

export default function DashboardPage() {
  const { data: user } = useUser();
  // Staff without the reports right get their own simple home.
  if (usesStaffHome(user)) return <StaffHome />;
  return <BusinessDashboard owner={isOwner(user)} />;
}

/**
 * Home is a glance: today's numbers, what needs attention, the latest sales. Profit details,
 * your week, charts and top customers are in Reports (one tap away).
 */
function BusinessDashboard({ owner }: { owner: boolean }) {
  const { data: summary, isLoading: summaryLoading } = useSummary('daily');
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  // Profit and cost prices are for the owner only
  const { data: profit } = useProfit('this_month', owner);

  const isAnyLoading = summaryLoading || analyticsLoading || txLoading;
  // New business with nothing recorded yet: show what to do first.
  const isNewUser = !txLoading && Array.isArray(transactions) && transactions.length === 0;
  const list = Array.isArray(transactions) ? transactions : undefined;

  return (
    <div className="space-y-6">
      {owner && <CreditsBanner />}
      {owner && isNewUser && <GetStarted />}
      <KpiCards
        summary={summary}
        analytics={analytics}
        transactionCount={list ? list.length : 0}
        isLoading={isAnyLoading}
        profit={owner ? profit : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {owner && <ThingsToCheck />}
        <RecentTransactions transactions={list} isLoading={txLoading} />
      </div>

      {owner && <LoansCard />}
    </div>
  );
}
