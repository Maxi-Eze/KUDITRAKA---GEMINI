export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'transfer' | 'pos' | 'card' | 'cheque' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number | string;
  item: string;
  customer_id: string | null;
  payment_method: PaymentMethod | string;
  date: string;
  raw_input: string | null;
  quantity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  item: string;
  customer: string;
  payment_method: string;
  quantity?: number;
  isQuery?: boolean;
  queryType?: 'spend' | 'income' | 'stock' | 'balance';
  queryItem?: string;
  queryTimeframe?: string;
}

export type BusinessSector = 'Retail & Trade' | 'Professional Services' | 'Food & Catering' | 'Manufacturing' | 'Other';

export interface User {
  id: string;
  businessName: string;
  ownerName: string;
  businessSector?: BusinessSector;
  inventoryEnabled: boolean;
  onboarded: boolean;
  email: string;
  phone?: string;
  address?: string;
  cacNumber?: string;
  businessType?: string;
  businessSize?: string;
  salesChannel?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerData {
  name: string;
  count: number;
  total: number;
  income: number;
  expense: number;
  transactions: Transaction[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parsed?: ParsedTransaction;
  confirmed?: boolean;
  timestamp: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
  cost_price: number | string;
  selling_price: number | string;
  category: string;
  last_restocked?: string;
}

export interface ReconciliationLog {
  id: string;
  item_id: string;
  item_name: string;
  system_stock: number;
  actual_stock: number;
  difference: number;
  reason: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}

export interface ChatHistoryMessage {
  id?: string;
  session_id?: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  parsed?: ParsedTransaction;
  confirmed?: boolean;
  created_at: string;
}

export interface ParsedTransactionResponse {
  data: ParsedTransaction;
}

export interface FinancialSnapshot {
  today_income: number;
  today_expenses: number;
  today_net: number;
  this_month_income: number;
  this_month_expenses: number;
  this_month_net: number;
  recent_transactions: Transaction[];
}

export interface ChatReplyResponse {
  data: {
    reply: string;
    financial_snapshot?: FinancialSnapshot;
    session_id?: string;
  };
}
