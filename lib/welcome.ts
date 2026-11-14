/**
 * The phone welcome screen shows until an account has been created or signed in on this device.
 * Remembered in the browser; storage can be blocked or cleared, so every read and write is guarded.
 */
const ACCOUNT_KEY = 'misa-account-on-device';
const PASSED_KEY = 'misa-welcome-passed';

/** Call when someone creates an account or signs in here (owner or staff). */
export function markAccountOnDevice() {
  try {
    localStorage.setItem(ACCOUNT_KEY, '1');
  } catch {}
}

export function hasAccountOnDevice(): boolean {
  try {
    return localStorage.getItem(ACCOUNT_KEY) === '1' || !!localStorage.getItem('ai-bk-token');
  } catch {
    return false;
  }
}

/** Tapped past the welcome screen in this visit, so moving between sign-in and sign-up doesn't show it again. */
export function markWelcomePassed() {
  try {
    sessionStorage.setItem(PASSED_KEY, '1');
  } catch {}
}

export function welcomePassed(): boolean {
  try {
    return sessionStorage.getItem(PASSED_KEY) === '1';
  } catch {
    return false;
  }
}
