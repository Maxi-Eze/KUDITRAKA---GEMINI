'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { ProfileInfo } from '@/components/features/profile/ProfileInfo';
import { BusinessSettings } from '@/components/features/profile/BusinessSettings';
import { WhatsAppLink } from '@/components/features/profile/WhatsAppLink';
import { TeamPanel } from '@/components/features/team/TeamPanel';
import { useUser } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { User, Building2, MessageCircle, Users } from 'lucide-react';

export default function ProfilePage() {
  const { data: user, isLoading } = useUser();
  const [tab, setTab] = useState('profile');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Allow links like /profile?tab=whatsapp (e.g. from the dashboard's "Link WhatsApp" step).
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (requested === 'profile' || requested === 'business' || requested === 'whatsapp' || requested === 'team') setTab(requested);
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return null;

  const handleEdit = () => {
    setTab('profile');
    requestAnimationFrame(() => {
      const el = document.getElementById('profile-name') as HTMLInputElement | null;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <ProfileHeader user={user} onEdit={handleEdit} />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as string)}
        orientation={isDesktop ? 'vertical' : 'horizontal'}
        className={isDesktop ? 'gap-6' : undefined}
      >
        <TabsList
          variant="line"
          className="w-full lg:w-56 lg:shrink-0 lg:flex-col lg:items-stretch"
        >
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
          <TabsTrigger value="team">
            <Users className="hidden sm:block" />
            Team
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

        <TabsContent value="team">
          <TeamPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
