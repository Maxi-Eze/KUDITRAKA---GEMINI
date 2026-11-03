import type { StaffRight, StaffRole, User } from './types';

/**
 * What each login can open and do in the web app, from the staff member's ticked rights.
 * The server enforces the same rules; this only decides what to show.
 */

/** Plain-language rights, in the order the owner sees them. */
export const RIGHTS: { key: StaffRight; label: string; hint?: string; warn?: boolean }[] = [
  { key: 'record_sales', label: 'Record sales and expenses' },
  { key: 'fix_own_sales', label: 'Fix own mistakes (first 10 minutes)' },
  { key: 'add_stock_items', label: 'Add new stock items' },
  { key: 'change_stock', label: 'Change stock counts', hint: 'They must give a reason. It shows in your history.' },
  { key: 'change_prices', label: 'Change selling prices' },
  { key: 'see_cost_prices', label: 'See cost prices' },
  { key: 'see_shop_sales', label: "See the shop's total sales" },
  { key: 'see_reports', label: 'See profit and reports' },
  { key: 'delete_sales', label: 'Delete sales', hint: 'Only for someone you trust fully', warn: true },
];

/** The starting ticks for each level. Keep in step with the backend's ROLE_DEFAULTS. */
export const ROLE_DEFAULTS: Record<StaffRole, StaffRight[]> = {
  attendant: ['record_sales', 'fix_own_sales', 'add_stock_items'],
  manager: ['record_sales', 'fix_own_sales', 'add_stock_items', 'change_stock', 'change_prices', 'see_shop_sales'],
  viewer: ['see_shop_sales', 'see_reports', 'see_cost_prices'],
};

export const ROLE_LABEL: Record<string, string> = {
  attendant: 'Sales attendant',
  manager: 'Manager',
  viewer: 'Viewer',
};

export const isOwner = (user?: User | null) => !!user && !user.staff;

/** Owners can do everything; staff only what is ticked. */
export const hasRight = (user: User | null | undefined, right: StaffRight) =>
  !!user && (!user.staff || user.staff.rights.includes(right));

/** Staff without reports get the simple staff home instead of the business dashboard. */
export const usesStaffHome = (user?: User | null) => !!user?.staff && !hasRight(user, 'see_reports');

/** True if this login may open the page at `pathname`. */
export function canOpenPage(user: User | null | undefined, pathname: string): boolean {
  if (!user) return false;
  if (!user.staff) return true;
  const allowed: Record<string, boolean> = {
    '/dashboard': true,
    '/transactions': true,
    '/inventory': true,
    '/chat': hasRight(user, 'record_sales'),
    '/chat-history': hasRight(user, 'record_sales'),
    '/customers': hasRight(user, 'see_shop_sales'),
    '/reports': hasRight(user, 'see_reports'),
  };
  return Object.entries(allowed).some(([p, ok]) => ok && (pathname === p || pathname.startsWith(`${p}/`)));
}

/** Plainer page names for staff who only see their own work. */
export function staffPageLabel(user: User | null | undefined, href: string): string | undefined {
  if (!user?.staff) return undefined;
  if (href === '/dashboard' && usesStaffHome(user)) return 'Home';
  if (href === '/transactions' && !hasRight(user, 'see_shop_sales')) return 'My sales';
  if (href === '/inventory') return 'Stock';
  return undefined;
}
