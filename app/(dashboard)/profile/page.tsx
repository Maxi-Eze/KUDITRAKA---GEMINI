'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { ProfileInfo } from '@/components/features/profile/ProfileInfo';
import { BusinessSettings } from '@/components/features/profile/BusinessSettings';
import { WhatsAppLink } from '@/components/features/profile/WhatsAppLink';
import { useUser } from '@/hooks/useAuth';
import { User, Building2, MessageCircle } from 'lucide-react';

export default function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const [tab, setTab] = useState('profile');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
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

      <ProfileHeader user={user} />

      <Tabs value={tab} onValueChange={(value) => setTab(value as string)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile">
            <User />
            Profile
          </TabsTrigger>
          <TabsTrigger value="business">
            <Building2 />
            Business
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
          <ProfileInfo user={user} />
        </TabsContent>

        <TabsContent value="business">
          <BusinessSettings />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppLink />
        </TabsContent>
      </Tabs>
    </div>
  );
}
