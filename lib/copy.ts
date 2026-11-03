/**
 * Wording that depends on who is reading, kept in one place.
 * Staff see "your employer"; the owner sees "you". Say "business", not "shop":
 * not every business is a shop.
 */
export const STAFF_COPY = {
  loginSubtitle: 'Use the phone number and PIN your employer gave you',
  forgotPin: 'Forgot your PIN? Ask your employer for a new one.',
  noReports: 'Only your employer can see profit and reports.',
  pageBlocked: 'Only your employer can see this page.',
} as const;

export const OWNER_COPY = {
  teamIntro: 'Staff can record sales. You choose what else each person can do.',
} as const;
