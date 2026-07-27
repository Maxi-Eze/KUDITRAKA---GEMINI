'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileInfo } from '@/components/features/profile/ProfileInfo';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { BusinessSettings } from '@/components/features/profile/BusinessSettings';
import { WhatsAppLink } from '@/components/features/profile/WhatsAppLink';
import { useUser } from '@/hooks/useAuth';

type ActiveSection = 'info' | 'business' | 'whatsapp';

export default function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const [activeSection, setActiveSection] = useState<ActiveSection>('info');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Profile"
        description="Manage your account and business settings"
      />

      <div className="flex gap-2">
        <Button
          variant={activeSection === 'info' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('info')}
        >
          Profile
        </Button>
        <Button
          variant={activeSection === 'business' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('business')}
        >
          Business Settings
        </Button>
        <Button
          variant={activeSection === 'whatsapp' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('whatsapp')}
        >
          WhatsApp
        </Button>
      </div>

      {activeSection === 'info' && (
        <div className="space-y-4">
          <ProfileInfo user={user} />
          <ProfileForm />
        </div>
      )}

      {activeSection === 'business' && <BusinessSettings />}

      {activeSection === 'whatsapp' && <WhatsAppLink />}
    </div>
  );
}