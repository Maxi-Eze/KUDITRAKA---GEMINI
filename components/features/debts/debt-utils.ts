import { formatCurrency } from '@/lib/utils';

export const OVERDUE_DAYS = 30;

/** Whole days since a date ("today" = 0). */
export const daysSince = (iso: string | null) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000))) : 0;

export const daysLabel = (days: number) => (days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`);

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

/**
 * Opens the trader's own WhatsApp with a polite reminder ready to send. Without a number,
 * WhatsApp lets them pick the contact.
 */
export function whatsappReminderLink(opts: {
  name: string;
  phone: string | null;
  balance: number;
  items: string[];
  businessName?: string;
}) {
  const what = opts.items.length ? ` for ${opts.items.join(', ')}` : '';
  const from = opts.businessName ? ` from ${opts.businessName}` : '';
  const text =
    `${greeting()} ${opts.name}, this is a friendly reminder${from} about ${formatCurrency(opts.balance)}${what}. ` +
    `Thank you!`;
  const number = (opts.phone || '').replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
