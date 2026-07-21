'use client';

import { PageHeader } from '@/components/ui/page-header';

export default function OnboardingPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Welcome to Kuditraka.Ai"
        description="Set up your business profile to get started"
      />
      <div className="text-muted-foreground">Onboarding flow coming in Phase 2.</div>
    </div>
  );
}
