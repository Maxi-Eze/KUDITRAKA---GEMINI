export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'transfer' | 'pos' | 'card' | 'cheque' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number | string;
  item: string;
  customer_id: string | null;
  customer_name?: string | null;
  category?: string | null;
  payment_method: PaymentMethod | string;
  date: string;
  raw_input: string | null;
  quantity?: number;
  created_at?: string;
  updated_at?: string;
  /** What saving this transaction did to inventory (create/update responses only). */
  stock?: StockResult;
  /** Staff member who recorded it; null/absent = the owner. */
  recorded_by_member_id?: string | null;
  recorded_by_name?: string | null;
  /** How it arrived: 'web', 'whatsapp', … (older records: null). */
  source?: string | null;
}

/** Returned by the backend when a sale/restock is saved. */
export interface StockResult {
  status: 'updated' | 'not_tracked' | 'ignored' | 'tracking_off' | 'not_applicable';
  item: string;
  item_id?: string;
  inventory_name?: string;
  change?: number;
  previous?: number;
  current?: number;
  min_stock?: number;
  oversold?: number;
  low_stock?: boolean;
  should_offer_tracking?: boolean;
  suggested_price?: number | null;
  /** Stock items with a similar name, for "Did you mean Milo 500g?" (only when not_tracked). */
  suggestions?: StockRef[];
  /** The saved transaction, so "Yes, that one" can be linked to it. */
  transaction_id?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  /** Set when a staff member is logged in (not the owner). */
  staff?: StaffInfo | null;
}

export type StaffRole = 'attendant' | 'manager' | 'viewer';

/** What a staff member is allowed to do (the owner ticks these). */
export type StaffRight =
  | 'record_sales'
  | 'fix_own_sales'
  | 'add_stock_items'
  | 'change_stock'
  | 'change_prices'
  | 'see_cost_prices'
  | 'see_shop_sales'
  | 'see_reports'
  | 'delete_sales';

export interface StaffInfo {
  memberId: string;
  name: string;
  role: StaffRole;
  rights: StaffRight[];
}

export interface SalesSummary {
  count: number;
  total: number;
}

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  permissions: StaffRight[];
  status: 'active' | 'removed';
  last_active_at: string | null;
  created_at: string;
  today?: SalesSummary;
}

export interface ActivityEntry {
  id: string;
  action: string;
  details: Record<string, any> | null;
  source: string | null;
  created_at: string;
}

export interface TeamMemberDetail extends TeamMember {
  week: SalesSummary;
  activity: ActivityEntry[];
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
  barcode?: string | null;
  /** On: Misa sets min_stock from how fast it sells (about 3 days of sales). Off: the trader chose it. */
  min_stock_auto?: boolean;
  /** Average sold per day over the last 4 weeks. */
  daily_sales?: number;
}

/** One line read from a list, photo, PDF or file, before the trader confirms it. */
export interface StockIntakeLine {
  name: string;
  quantity: number | null;
  unit_cost: number | null;
  selling_price: number | null;
  barcode?: string | null;
}

export interface StockRef {
  id: string;
  name: string;
  stock: number;
}

/** exact: same item · alias: the trader's saved name for it · suggest: "Did you mean…?" · new */
export interface StockLineMatch {
  type: 'exact' | 'alias' | 'suggest' | 'new';
  item?: StockRef;
  suggestions?: StockRef[];
}

export interface StockReadResult {
  items: (StockIntakeLine & { match: StockLineMatch })[];
  supplier: string | null;
  total: number | null;
  unreadable: string[];
  used_ai: boolean;
}

export interface StockSaveLine {
  name: string;
  quantity: number;
  unit_cost?: number | null;
  selling_price?: number | null;
  barcode?: string | null;
  item_id?: string | null;
  original_name?: string | null;
}

export interface StockSaveResult {
  added: StockRef[];
  restocked: (StockRef & { added: number })[];
  expenses_recorded: number;
  total_cost: number;
}

export interface BarcodeLookup {
  barcode: string;
  item: (StockRef & { selling_price: number }) | null;
  /** A name another business gave this barcode. */
  suggested_name: string | null;
}

/** Two stock items that look like the same thing ("Milo" and "Milo refill"). */
export interface DuplicatePair {
  items: [StockRef & { selling_price: number }, StockRef & { selling_price: number }];
  score: number;
}

export interface MergeResult {
  item: InventoryItem;
  /** Names of the items folded in. */
  merged: string[];
  /** Barcodes that couldn't move over, because the kept item already has one. */
  dropped_barcodes: string[];
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
  /** What the user did with a transaction card; null/absent = not answered yet. */
  card_status?: CardStatus | null;
  created_at: string;
}

export type CardStatus = 'saved' | 'discarded';

export interface FinancialSnapshot {
  today_income: number;
  today_expenses: number;
  today_net: number;
  this_month_income: number;
  this_month_expenses: number;
  this_month_net: number;
  recent_transactions: Transaction[];
}
