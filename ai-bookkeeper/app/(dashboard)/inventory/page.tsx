'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function InventoryPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Inventory"
        description="Manage your stock and inventory items"
      />
      <div className="text-muted-foreground">Inventory management coming in Phase 2.</div>
    </div>
  );
}
