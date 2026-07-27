export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'transfer' | 'pos' | 'card' | 'cheque' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  item: string;
  customer: string;
  payment_method: PaymentMethod | string;
  date: string;
  rawInput: string;
  quantity?: number;
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
  totalTransactions: number;
  totalAmount: number;
  transactions: Transaction[];
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
  minStock: number;
  costPrice: number;
  sellingPrice: number;
  category: string;
  lastRestocked?: string;
}

export interface ReconciliationLog {
  id: string;
  itemId: string;
  itemName: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  reason: string;
  timestamp: string;
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
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  parsed?: ParsedTransaction;
  confirmed?: boolean;
  created_at: string;
}

export interface ParsedTransactionResponse {
  data: ParsedTransaction;
}

export interface ChatReplyResponse {
  data: {
    reply: string;
  };
}
