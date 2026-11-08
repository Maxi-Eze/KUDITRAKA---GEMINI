'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { canOpenPage } from '@/lib/permissions';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useUser } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/ui/loading-page';
import { STAFF_COPY } from '@/lib/copy';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user) {
        router.replace('/');
      } else if (!user.onboarded) {
        router.replace('/onboarding');
      }
    }
  }, [mounted, isLoading, user, router]);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  if (!mounted || isLoading) return <LoadingPage />;
  if (!user || !user.onboarded) return <LoadingPage />;

  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0 h-screen">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        {/* Exactly the menu's width. Tapping a section, or outside the menu, closes it. */}
        <SheetContent side="left" showCloseButton={false} className="gap-0 p-0 data-[side=left]:w-64 data-[side=left]:sm:max-w-64">
          <Sidebar collapsed={false} onToggle={() => {}} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggle={toggle}
        />
        <main className="flex-1 p-4 pb-20 lg:p-6 lg:pb-6">
          {canOpenPage(user, pathname) ? children : (
            // Staff opened an owner page (e.g. by typing the address). The server blocks the data too.
            <div className="mx-auto mt-16 max-w-sm text-center">
              <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-medium">{STAFF_COPY.pageBlocked}</p>
              <Link href="/dashboard" className={buttonVariants({ className: 'mt-4' })}>Go home</Link>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
