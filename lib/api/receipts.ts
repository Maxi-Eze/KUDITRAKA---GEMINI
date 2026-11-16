import { client } from './client';

/** Branded receipts (server PR KudiTraka/kudi-tracker-v2#30). */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.kuditraka.name.ng/api';
/** The server returns file paths like "/api/public/receipts/<token>/image"; this makes them full links. */
export const apiFileUrl = (path: string) => `${new URL(API_URL).origin}${path}`;

export interface ReceiptItem {
  name: string;
  qty: number;
  unit?: string | null;
  amount: string;
}

/** What the private link shows (also returned when the business makes a receipt). */
export interface SaleReceipt {
  business_name: string;
  business_line?: string | null;
  receipt_no: string;
  date_text: string;
  customer?: string | null;
  items: ReceiptItem[];
  total: string;
  paid_by?: string | null;
  owing?: string | null;
  web: string;
  image_url: string;
  pdf_url: string;
}

export interface MadeReceipt extends SaleReceipt {
  token: string;
  /** The private link to give the customer: misa.kuditraka.name.ng/r/<token> */
  url: string;
}

export interface Payment {
  id: string;
  reference: string;
  amount_paid: number;
  credits: number;
  fees: number;
  status: 'pending' | 'successful' | 'failed' | 'expired' | 'abandoned' | string;
  created_at: string;
  paid_at: string | null;
  has_receipt: boolean;
}

export const receiptsApi = {
  /** Make (or reuse) the private receipt link for these sales. Owners only. */
  make: (transactionIds: string[]) => client.post<MadeReceipt>('/receipts', { transaction_ids: transactionIds }),
  /** The business's top-ups, newest first. */
  payments: () => client.get<{ payments: Payment[] }>('/wallet/payments?limit=50'),
  /** Credits receipt for one paid top-up, as a file. */
  paymentReceipt: (id: string, format: 'pdf' | 'jpg' = 'pdf') => client.getFile(`/wallet/payments/${id}/receipt?format=${format}`),
};

/** For the public /r/<token> page (no sign-in). Returns null when the link is wrong or the server is not ready. */
export async function fetchPublicReceipt(token: string): Promise<SaleReceipt | null> {
  if (!/^[A-Za-z0-9_-]{24}$/.test(token)) return null;
  try {
    const res = await fetch(`${API_URL}/public/receipts/${token}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data as SaleReceipt) ?? null;
  } catch {
    return null;
  }
}
