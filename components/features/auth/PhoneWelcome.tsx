'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthBranding } from '@/components/features/auth/AuthBranding';
import { hasAccountOnDevice, markWelcomePassed, welcomePassed } from '@/lib/welcome';

/**
 * Phones have no room for the description panel beside the form, so new visitors see it here first,
 * until an account has been created or signed in on this device. Laptops never see this screen.
 */
export function PhoneWelcome() {
  const pathname = usePathname();
  const router = useRouter();
  // null = not checked yet: cover the form so returning traders don't see it jump
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    setShow(!hasAccountOnDevice() && !welcomePassed());
  }, []);

  if ((pathname !== '/' && pathname !== '/signup') || show === false) return null;
  if (show === null) return <div className="fixed inset-0 z-30 bg-background lg:hidden" />;

  const go = (href: string) => {
    markWelcomePassed();
    setShow(false);
    if (href !== pathname) router.push(href);
  };

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-background lg:hidden">
      <div className="flex min-h-full flex-col items-center justify-center gap-8 p-6">
        <AuthBranding />
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => go('/signup')}>
            Create account
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => go('/')}>
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
