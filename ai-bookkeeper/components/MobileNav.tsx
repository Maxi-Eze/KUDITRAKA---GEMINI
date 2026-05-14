'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, ArrowLeftRight, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './MobileNav.module.css';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show on auth/onboarding pages
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';
  if (isAuthPage || !user) return null;

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Home' },
    { href: '/chat', icon: MessageSquare, label: 'AI' },
    { href: '/transactions', icon: ArrowLeftRight, label: 'Logs' },
    { href: '/profile', icon: User, label: 'Me' },
  ];

  return (
    <nav className={styles.mobileNav}>
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`${styles.navLink} ${active ? styles.active : ''}`}>
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
