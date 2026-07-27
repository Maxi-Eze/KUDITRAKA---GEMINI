'use client';

import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useLogout } from '@/hooks/useAuth';

interface UserCardProps {
  collapsed: boolean;
  className?: string;
}

export function UserCard({ collapsed, className }: UserCardProps) {
  const { data: user, isLoading } = useUser();
  const logout = useLogout();

  const initials = user
    ? user.ownerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const firstName = user ? user.ownerName.split(' ')[0] : '';
  const email = user ? user.email : '';

  return (
    <div
      className={cn(
        'group flex items-center px-3 py-3 transition-colors',
        collapsed ? 'justify-center' : 'gap-3',
        className,
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isLoading ? 'bg-sidebar-accent animate-pulse' : 'bg-primary',
        )}
      >
        <span className="text-primary-foreground font-semibold text-xs">
          {isLoading ? '' : initials}
        </span>
      </div>

      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <>
                <div className="h-3 bg-sidebar-accent rounded animate-pulse w-20 mb-1" />
                <div className="h-2.5 bg-sidebar-accent rounded animate-pulse w-28" />
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-sidebar-foreground truncate leading-tight">
                  {firstName || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate leading-tight">
                  {email || 'Not logged in'}
                </p>
              </>
            )}
          </div>
          {!isLoading && (
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          )}
        </>
      )}

      {collapsed && !isLoading && (
        <button
          onClick={logout}
          className="absolute left-full ml-2 p-1.5 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-50"
          title="Log out"
        >
          <LogOut size={15} />
        </button>
      )}
    </div>
  );
}
