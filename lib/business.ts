/**
 * Business types offered at sign-up and in Business settings. The same list as Misa on WhatsApp
 * (SECTOR_OPTIONS in the server's messaging.service), so a business reads the same either way.
 */
export const BUSINESS_SECTORS = [
  'Retail & Provisions',
  'Pharmaceuticals & Surgical',
  'Electronics & Phones',
  'Building Materials',
  'Fashion & Beauty',
  'Food & Drinks',
  'Wholesale & Distribution',
  'POS & Financial Services',
  'Services',
  'Other',
] as const;

/** The list, plus a business's current type if it was saved from an older list, so it still shows. */
export const sectorOptions = (current?: string | null): { value: string; label: string }[] => {
  const list: string[] = [...BUSINESS_SECTORS];
  if (current && !list.includes(current)) list.unshift(current);
  return list.map((s) => ({ value: s, label: s }));
};
