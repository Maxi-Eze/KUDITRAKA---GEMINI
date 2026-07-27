'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/ui/loading-page';

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user.onboarded) {
      router.replace('/onboarding');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user || !user.onboarded) {
    return null;
  }

  return <>{children}</>;
}
