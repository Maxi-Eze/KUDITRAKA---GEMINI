'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function ReportsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Reports"
        description="View financial reports and analytics"
      />
      <div className="text-muted-foreground">Reports coming in Phase 2.</div>
    </div>
  );
}
