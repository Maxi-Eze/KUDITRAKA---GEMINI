'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useSummary, useAnalytics } from '@/hooks/useReports';
import { useUser } from '@/hooks/useAuth';
import { KpiCards } from '@/components/features/dashboard/KpiCards';
import { RevenueChart } from '@/components/features/dashboard/RevenueChart';
import { ExpenseChart } from '@/components/features/dashboard/ExpenseChart';
import { RecentTransactions } from '@/components/features/dashboard/RecentTransactions';
import { TopCustomers } from '@/components/features/dashboard/TopCustomers';
import { GetStarted } from '@/components/features/dashboard/GetStarted';
import { StaffHome } from '@/components/features/team/StaffHome';
import { isAttendant, isOwner } from '@/lib/permissions';

export default function DashboardPage() {
  const { data: user } = useUser();
  // Sales attendants get their own simple home; reports are for the owner (and viewers).
  if (isAttendant(user)) return <StaffHome />;
  return <BusinessDashboard showGetStarted={isOwner(user)} />;
}

function BusinessDashboard({ showGetStarted }: { showGetStarted: boolean }) {
  const { data: summary, isLoading: summaryLoading } = useSummary('daily');
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const isAnyLoading = summaryLoading || analyticsLoading || txLoading;
  // New business with nothing recorded yet: show what to do first.
  const isNewUser = !txLoading && Array.isArray(transactions) && transactions.length === 0;

  return (
    <div className="space-y-6">
      {showGetStarted && isNewUser && <GetStarted />}
      <KpiCards
        summary={summary}
        analytics={analytics}
        transactionCount={Array.isArray(transactions) ? transactions.length : 0}
        isLoading={isAnyLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart
          transactions={Array.isArray(transactions) ? transactions : undefined}
          isLoading={txLoading}
        />
        <ExpenseChart analytics={analytics} isLoading={analyticsLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions
          transactions={Array.isArray(transactions) ? transactions : undefined}
          isLoading={txLoading}
        />
        <TopCustomers
          transactions={Array.isArray(transactions) ? transactions : undefined}
          isLoading={txLoading}
        />
      </div>
    </div>
  );
}
