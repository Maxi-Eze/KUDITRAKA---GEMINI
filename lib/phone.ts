/**
 * Nigerian phone numbers, typed the way people actually type them:
 * "0803 456 7890", "08034567890", "803-456-7890", "2348034567890", "+234 803 456 7890".
 *
 * Everything is converted to international format (+2348034567890) before it is sent, so the
 * backend always stores one form of each number (it strips the "+" and matches incoming
 * WhatsApp messages against that).
 */

/** Convert to +234XXXXXXXXXX, or return null if it isn't a valid Nigerian mobile number. */
export function toNigerianInternational(raw: string): string | null {
  const digits = (raw || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  let national: string | null = null;

  if (/^\+234\d{10}$/.test(digits)) national = digits.slice(4);
  else if (/^234\d{10}$/.test(digits)) national = digits.slice(3);
  else if (/^0\d{10}$/.test(digits)) national = digits.slice(1);
  else if (/^\d{10}$/.test(digits)) national = digits;

  // Nigerian mobile numbers start 70x, 80x, 81x, 90x, 91x (after the leading 0).
  if (!national || !/^[789][01]\d{8}$/.test(national)) return null;
  return `+234${national}`;
}

export const PHONE_HINT = 'e.g. 0803 456 7890 or +234 803 456 7890';
export const PHONE_ERROR = 'Enter a Nigerian mobile number, e.g. 0803 456 7890';
