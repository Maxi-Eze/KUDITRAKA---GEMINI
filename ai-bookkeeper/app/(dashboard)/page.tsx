'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Business Dashboard"
        description="Real-time overview of your business finances"
      />
      <div className="text-muted-foreground">Dashboard content coming in Phase 2.</div>
    </div>
  );
}
