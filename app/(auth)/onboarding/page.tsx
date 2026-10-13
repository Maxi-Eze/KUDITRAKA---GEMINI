'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/ui/loading-page';
import { OnboardingForm } from '@/components/features/auth/OnboardingForm';

export default function OnboardingPage() {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/');
      } else if (user.onboarded) {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.onboarded) return <LoadingPage />;

  return <OnboardingForm user={user} />;
}
