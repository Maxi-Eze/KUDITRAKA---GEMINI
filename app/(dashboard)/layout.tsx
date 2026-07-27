import { AppShell } from '@/components/layout/AppShell';
import { OnboardingGate } from '@/components/features/auth/OnboardingGate';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <OnboardingGate>{children}</OnboardingGate>
    </AppShell>
  );
}
