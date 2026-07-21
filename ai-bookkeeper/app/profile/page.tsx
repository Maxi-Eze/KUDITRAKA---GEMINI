'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function ProfilePage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Profile"
        description="Manage your account settings"
      />
      <div className="text-muted-foreground">Profile settings coming in Phase 2.</div>
    </div>
  );
}
