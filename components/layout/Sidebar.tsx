'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  ArrowLeftRight,
  Users,
  Package,
  BarChart3,
  Clock,
  User,
  HandCoins,
  Landmark,
  Coins,
  Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserCard } from './UserCard';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useUser } from '@/hooks/useAuth';
import { canOpenPage, staffPageLabel, usesStaffHome } from '@/lib/permissions';
import { useCreditBalance, useCreditsActive, useIsCreditsAdmin } from '@/hooks/useCredits';
import { formatCredits } from '@/lib/credits';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/debts', label: 'Debts', icon: HandCoins },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/loans', label: 'Misa Loans', icon: Landmark },
  { href: '/chat-history', label: 'Chat History', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Called when a section is tapped (the phone menu closes itself). */
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ collapsed, onToggle, onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const { data: user } = useUser();
  // Staff only see the pages they can use, with plainer names; the staff home links to their chats.
  // Credits show once charging is switched on (owners only; staff can't open the page).
  const creditsActive = useCreditsActive();
  const { data: credit } = useCreditBalance(creditsActive);
  const isCreditsAdmin = useIsCreditsAdmin();
  const extra = [
    ...(creditsActive ? [{ href: '/credits', label: 'Credits', icon: Coins }] : []),
    ...(isCreditsAdmin ? [{ href: '/admin/credits', label: 'Give credits', icon: Gift }] : []),
  ];
  const all = [...navItems.slice(0, -1), ...extra, navItems[navItems.length - 1]];
  const items = all
    .filter((item) => canOpenPage(user, item.href) && !(usesStaffHome(user) && item.href === '/chat-history'))
    .map((item) => ({ ...item, label: staffPageLabel(user, item.href) || item.label }));

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border h-screen transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
        className,
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-sidebar-border shrink-0',
          collapsed ? 'justify-center px-2 py-4' : 'gap-2.5 px-5 py-4',
        )}
      >
        <BrandLogo variant="icon" className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <span className="font-semibold text-sidebar-foreground text-sm truncate">
            Kuditraka.Ai
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors relative',
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-sidebar-primary" />
              )}
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.href === '/credits' && credit && (
                <span className="ml-auto shrink-0 text-xs font-normal text-sidebar-foreground/50">
                  {formatCredits(credit.balance).replace(/ credits?$/, '')}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border shrink-0">
        <UserCard collapsed={collapsed} />
      </div>
    </aside>
  );
}
