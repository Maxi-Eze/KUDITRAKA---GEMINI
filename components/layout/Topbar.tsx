'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Menu,
  Search,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useLogout } from '@/hooks/useAuth';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/chat': 'Chat',
  '/transactions': 'Transactions',
  '/customers': 'Customers',
  '/inventory': 'Inventory',
  '/reports': 'Reports',
  '/chat-history': 'Chat History',
  '/profile': 'Profile',
};

interface TopbarProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function Topbar({ onMenuClick, collapsed, onToggle, className }: TopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: user } = useUser();
  const logout = useLogout();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [notifOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpen]);

  const label =
    routeLabels[pathname] ||
    routeLabels['/' + pathname.split('/')[1]] ||
    'Dashboard';

  const initials = user
    ? user.ownerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center h-14 px-4 lg:px-6',
        'bg-background/80 backdrop-blur-md border-b border-border',
        className,
      )}
    >
      {/* Left: collapse toggle + hamburger + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggle}
          className="hidden lg:flex p-2 rounded-md text-foreground/60 hover:text-foreground hover:bg-accent transition-colors shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-foreground/60 hover:text-foreground hover:bg-accent transition-colors lg:hidden shrink-0"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-sm font-semibold text-foreground truncate">
          {label}
        </h1>
      </div>

      {/* Center: search placeholder */}
      <div className="hidden md:flex flex-1 justify-center px-8">
        <div className="flex items-center gap-2 w-full max-w-sm px-3 py-1.5 rounded-lg border border-border text-foreground/40 cursor-default">
          <Search size={15} />
          <span className="text-sm">Search...</span>
          <kbd className="ml-auto text-[10px] font-mono border border-border rounded px-1 py-0.5 bg-background/50">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: notifications + theme toggle + avatar */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="flex items-center justify-center w-9 h-9 rounded-md text-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-popover shadow-lg z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
              </div>
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="mx-auto text-foreground/20 mb-2" />
                <p className="text-sm text-foreground/50">No new notifications</p>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative flex items-center justify-center w-9 h-9 rounded-md text-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
          title="Toggle theme"
        >
          <Sun size={16} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon size={16} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Account menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title="Account menu"
              className="flex items-center gap-1 rounded-full pl-0.5 pr-1.5 py-0.5 text-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
            >
              <span className="flex w-8 h-8 items-center justify-center rounded-full bg-primary">
                <span className="text-primary-foreground font-semibold text-xs">
                  {initials}
                </span>
              </span>
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', menuOpen && 'rotate-180')}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-border bg-popover shadow-lg z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.ownerName || 'Your account'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
