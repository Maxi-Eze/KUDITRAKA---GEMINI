import type { User } from './types';

/**
 * What each kind of login can open in the web app. The server enforces the same rules;
 * this only decides what to show.
 */
const STAFF_PAGES: Record<string, string[]> = {
  attendant: ['/dashboard', '/chat', '/chat-history', '/transactions', '/inventory'],
  viewer: ['/dashboard', '/transactions', '/customers', '/inventory', '/reports'],
};

export const isOwner = (user?: User | null) => !!user && !user.staff;
export const isAttendant = (user?: User | null) => user?.staff?.role === 'attendant';
export const isViewer = (user?: User | null) => user?.staff?.role === 'viewer';

/** True if this login may open the page at `pathname`. Owners can open everything. */
export function canOpenPage(user: User | null | undefined, pathname: string): boolean {
  if (!user) return false;
  if (!user.staff) return true;
  const pages = STAFF_PAGES[user.staff.role] || [];
  return pages.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Only owners delete; viewers can't change anything. */
export const canDelete = (user?: User | null) => isOwner(user);
export const canEdit = (user?: User | null) => !isViewer(user);

export const ROLE_LABEL: Record<string, string> = {
  attendant: 'Sales attendant',
  viewer: 'Viewer',
};
