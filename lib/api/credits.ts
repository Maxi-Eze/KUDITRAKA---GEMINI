import { client } from './client';

/**
 * Credits: prepaid, 1 credit = ₦1. The server keeps the wallet; the website only shows it.
 * Owners only (the server blocks staff from these routes).
 */

export type BillingMode = 'shadow' | 'active';

export interface CreditPricing {
  pricing: Record<string, number>;
  variablePricing: {
    complex_ai_operation: { standard: number; voice_or_multi_agent: number };
    receipt_extraction: { image: number; pdf_document: number };
  };
  welcomeBonus: number;
  /** 'shadow' = charging is off (nothing is taken yet). */
  mode: BillingMode;
  descriptions: Record<string, string>;
}

export interface CreditUsageLine {
  operation: string;
  label: string;
  count: number;
  credits: number;
}

export interface CreditSummary {
  days: number;
  since: string;
  balance: number;
  used_total: number;
  used: CreditUsageLine[];
  /** Owner (member_id null, "You") and each staff member. */
  by_person: { member_id: string | null; name: string; count: number; credits: number }[];
  /** Records saved on credit when the balance ran out; the next top-up pays for them. */
  on_credit: { count: number; credits: number };
  added: { type: string; label: string; credits: number; date: string }[];
  /** Credits that expire within a week (charging on only). */
  expiring_soon?: { credits: number; date: string } | null;
  shadow: boolean;
}

/** What a top-up costs: the credits, plus payment fees (the payment fee and our service charge). */
export interface TopUpQuote {
  credits: number;
  payment_fee: number;
  service_charge: number;
  total: number;
}

export interface TopUpAccount {
  reference: string;
  /** Naira to transfer, exactly. */
  amount: number;
  credits: number;
  paymentFee: number;
  serviceCharge: number;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  expiresAt: string | null;
  status: string;
  isExistingPending?: boolean;
}

export interface PaymentCheck {
  status: string;
  amount: number;
  credits: number;
  credited: boolean;
}

export interface BusinessCredits {
  business_id: string;
  owner_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  balance: number;
}

/** A top-up as the Kuditraka team sees it. */
export interface AdminPayment {
  id: string;
  reference: string;
  business_id: string;
  business_name: string | null;
  business_owner_name: string | null;
  customer_phone: string | null;
  /** Naira paid (credits + payment fees). */
  amount: number;
  credits: number | string | null;
  status: 'pending' | 'successful' | 'failed' | 'expired' | 'abandoned';
  created_at: string;
  paid_at: string | null;
}

/** All credit settings (the server's billing config). */
export interface CreditSettings {
  mode: BillingMode;
  welcomeBonus: number;
  lowBalanceWarnAt: number;
  askAboveCredits: number;
  graceRecords: number;
  paidExpiryMonths?: number;
  freeExpiryDays?: number;
  expiryWarnDays?: number;
  pricing: Record<string, number>;
  variablePricing: {
    complex_ai_operation: { standard: number; voice_or_multi_agent: number };
    receipt_extraction: { image: number; pdf_document: number };
  };
  topUpFees: { percent: number; flat: number; flatWaivedBelow: number; cap: number; serviceCharge: number };
}

export const creditsApi = {
  balance: () => client.get<{ balance: number; currency: string }>('/wallet/balance'),
  pricing: () => client.get<CreditPricing>('/wallet/pricing'),
  usage: (days: number) => client.get<CreditSummary>(`/wallet/usage?days=${days}`),
  quote: (credits: number) => client.get<TopUpQuote>(`/wallet/topup-quote?credits=${credits}`),
  /** Creates a one-time bank account for exactly the total (or returns the one still waiting). */
  startTopUp: (credits: number) => client.post<TopUpAccount>('/wallet/topup', { amount: credits }),
  checkPayment: (reference: string) => client.post<PaymentCheck>('/wallet/verify', { reference }),

  // Kuditraka staff only (the server checks ADMIN_EMAILS)
  adminCheck: () => client.get<unknown>('/admin/wallet/config'),
  adminBusinesses: (search: string) =>
    client.get<{ businesses: BusinessCredits[]; total: number }>(
      `/admin/wallet/businesses?limit=20&search=${encodeURIComponent(search)}`,
    ),
  adminGive: (businessId: string, data: { amount: number; reason: string; notify: boolean }) =>
    client.post<unknown>(`/admin/wallet/businesses/${businessId}/adjust`, data),
  adminPayments: (search: string, status: string) =>
    client.get<{ payments: AdminPayment[]; total: number }>(
      `/admin/wallet/payments?limit=30&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ''}`,
    ),
  /** Ask Paystack again whether the money arrived; adds the credits if it did. */
  adminCheckPayment: (paymentId: string) =>
    client.post<{ status: string; credited: boolean; credits?: number }>(`/admin/wallet/payments/${paymentId}/reconcile`, {}),
  adminSettings: () => client.get<CreditSettings>('/admin/wallet/config'),
  /** Only the fields sent are changed. */
  adminSaveSettings: (changes: Partial<CreditSettings>) => client.put<CreditSettings>('/admin/wallet/config', changes),
};
