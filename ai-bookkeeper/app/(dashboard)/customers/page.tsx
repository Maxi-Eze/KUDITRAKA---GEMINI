'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function CustomersPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Customers"
        description="Track your customers and their transactions"
      />
      <div className="text-muted-foreground">Customer list coming in Phase 2.</div>
    </div>
  );
}
