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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserCard } from './UserCard';
import { BrandLogo } from '@/components/ui/BrandLogo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/chat-history', label: 'Chat History', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname();

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
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
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
