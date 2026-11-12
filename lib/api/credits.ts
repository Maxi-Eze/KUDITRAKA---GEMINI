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
};
