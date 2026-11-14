/** Credits wording and numbers for the website (1 credit = ₦1). */

export const formatCredits = (n: number) => {
  const v = Math.round(Number(n) || 0);
  return `${v.toLocaleString('en-NG')} ${v === 1 ? 'credit' : 'credits'}`;
};

export const formatNaira = (n: number) => `₦${Math.round(Number(n) || 0).toLocaleString('en-NG')}`;

/** Quick amounts on the top-up sheet. */
export const TOP_UP_PRESETS = [1000, 2000, 5000, 10000];
export const MIN_TOP_UP = 100;
export const MAX_TOP_UP = 5_000_000;

/** Below this, the dashboard shows a short "running low" note (only when charging is on). */
export const LOW_CREDITS = 300;

/** The one-time account expires; shows "mm:ss" left, or null once it has passed. */
export function timeLeft(expiresAt: string | null, now: number): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
