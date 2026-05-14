'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import SplashScreen from '@/components/SplashScreen';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isInitializing } = useAuth();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';

  return (
    <div className="app-container">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {!isAuthPage && user && !isInitializing && <Sidebar />}
      <main className={isAuthPage || !user ? 'main-full' : 'main-content'}>
        {!isInitializing && children}
      </main>
      <MobileNav />
    </div>
  );
}
