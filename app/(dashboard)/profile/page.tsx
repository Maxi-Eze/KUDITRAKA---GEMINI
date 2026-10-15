'use client';

import { useState } from 'react';
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
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <ProfileHeader user={user} />

      <Tabs value={tab} onValueChange={(value) => setTab(value as string)}>
        <TabsList className="w-full">
          <TabsTrigger value="profile">
            <User className="hidden sm:block" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="business">
            <Building2 className="hidden sm:block" />
            Business
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle className="hidden sm:block" />
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
