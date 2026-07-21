'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function TransactionsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Transactions"
        description="View and manage all your financial records"
      />
      <div className="text-muted-foreground">Transactions list coming in Phase 2.</div>
    </div>
  );
}
