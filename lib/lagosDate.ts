/**
 * Dates as the business sees them: Lagos time (WAT, UTC+1), whatever the phone or laptop clock says.
 * A sale at 12:30 am belongs to that day, not the day before (toISOString would give the day before).
 */
const LAGOS_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** "YYYY-MM-DD" in Lagos for a date/time (now if empty). */
export function lagosYmd(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? '' : LAGOS_DAY.format(d);
}

/** "YYYY-MM" in Lagos (now if empty). */
export function lagosMonth(date: Date | string = new Date()): string {
  return lagosYmd(date).slice(0, 7);
}

/** The last n Lagos days, oldest first, ending today: ["2026-11-05", …, "2026-11-11"]. */
export function lagosLastDays(n: number, now: Date = new Date()): string[] {
  const [y, m, d] = lagosYmd(now).split('-').map(Number);
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10));
  }
  return days;
}
