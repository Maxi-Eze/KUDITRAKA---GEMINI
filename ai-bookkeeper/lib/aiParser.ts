import { ParsedTransaction, PaymentMethod } from './types';

const incomeKeywords = ['sold', 'received', 'earned', 'sale', 'income', 'got', 'collected', 'revenue'];
const expenseKeywords = ['bought', 'paid', 'purchased', 'spent', 'expense', 'cost', 'payment', 'fee', 'bill'];
const queryKeywords = ['how much', 'total', 'summary', 'show me', 'list', 'what is', 'what was'];
const greetingKeywords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];

const paymentMethods: Record<string, PaymentMethod> = {
  transfer: 'transfer',
  bank: 'transfer',
  pos: 'pos',
  card: 'card',
  cash: 'cash',
  cheque: 'cheque',
  check: 'cheque',
};

function detectType(text: string): 'income' | 'expense' {
  const lower = text.toLowerCase();
  for (const kw of expenseKeywords) {
    if (lower.includes(kw)) return 'expense';
  }
  for (const kw of incomeKeywords) {
    if (lower.includes(kw)) return 'income';
  }
  return 'income';
}

function extractAmount(text: string): number {
  const match = text.match(/[₦#]?\s?(\d[\d,]*)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 0;
}

function extractCustomer(text: string): string {
  const patterns = [
    /\bto\s+(mr\.?\s+[a-z]+(?:\s+[a-z]+)?|mrs\.?\s+[a-z]+(?:\s+[a-z]+)?|miss\.?\s+[a-z]+(?:\s+[a-z]+)?|[a-z]+\s+[a-z]+(?:\s+stores?|\s+ltd)?)/i,
    /\bfrom\s+(mr\.?\s+[a-z]+(?:\s+[a-z]+)?|mrs\.?\s+[a-z]+(?:\s+[a-z]+)?|[a-z]+\s+[a-z]+(?:\s+stores?|\s+ltd)?)/i,
    /\bfor\s+[a-z]+\s+(?:to|from)\s+([a-z\s]+?)(?:\s+(?:via|by|using|with|cash|pos|transfer|card)|$)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      return m[1].trim().replace(/\s+/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return '';
}

function extractPaymentMethod(text: string): PaymentMethod {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(paymentMethods)) {
    if (lower.includes(key)) return val;
  }
  return 'cash';
}

function extractItem(text: string, type: 'income' | 'expense'): string {
  const lower = text.toLowerCase();
  let cleaned = lower
    .replace(/[₦#]?\s?\d[\d,]*/g, '')
    .replace(/\b(via|by|using|with)\b/g, '')
    .replace(/\b(transfer|cash|pos|card|cheque|check|bank)\b/g, '')
    .replace(/\b(to|from)\s+(mr\.?|mrs\.?|miss\.?)?\s*\w+(\s+\w+)*/g, '')
    .replace(/\b(sold|bought|paid|received|earned|purchased|spent|collected)\b/g, '')
    .replace(/\b(for|the|a|an)\b/g, '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!cleaned || cleaned.length < 2) {
    const m = text.match(/(?:sold|bought|purchased|paid for|received|got)\s+([a-z\s\d]+?)(?:\s+for|\s+\d|$)/i);
    if (m) cleaned = m[1].trim();
  }

  return cleaned
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .substring(0, 50) || (type === 'income' ? 'Product' : 'Expense');
}

function extractQuantity(text: string): number {
  const match = text.match(/(\d+)\s+(bags?|packs?|units?|cartons?|kg|pieces?|pcs)/i);
  if (match) return parseInt(match[1], 10);
  
  const genericMatch = text.match(/(\d+)\s+([a-z]+)/i);
  if (genericMatch && !['transfer', 'cash', 'pos'].includes(genericMatch[2].toLowerCase())) {
    return parseInt(genericMatch[1], 10);
  }
  return 1;
}

export function parseTransaction(input: string): ParsedTransaction {
  const lower = input.toLowerCase();
  const isQuery = queryKeywords.some(kw => lower.includes(kw)) || 
                   greetingKeywords.some(kw => lower.trim() === kw || lower.startsWith(kw + ' '));

  if (isQuery) {
    let queryType: 'spend' | 'income' | 'stock' | 'balance' = 'income';
    if (lower.includes('spent') || lower.includes('expense') || lower.includes('cost')) queryType = 'spend';
    else if (lower.includes('stock') || lower.includes('inventory') || lower.includes('how many')) queryType = 'stock';
    else if (lower.includes('balance') || lower.includes('net') || lower.includes('have left')) queryType = 'balance';

    let timeframe = 'this month';
    if (lower.includes('today')) timeframe = 'today';
    else if (lower.includes('week')) timeframe = 'this week';
    else if (lower.includes('yesterday')) timeframe = 'yesterday';
    else if (lower.includes('year')) timeframe = 'this year';

    // Try to find what item they are asking about
    const queryItem = extractItem(input, 'income');

    return { 
      type: 'income', amount: 0, item: 'Query', customer: '', payment_method: '',
      isQuery: true, queryType, queryItem, queryTimeframe: timeframe 
    };
  }

  const type = detectType(input);
  const amount = extractAmount(input);
  const customer = extractCustomer(input);
  const payment_method = extractPaymentMethod(input);
  const quantity = extractQuantity(input);
  const item = extractItem(input, type);

  return { type, amount, item, customer, payment_method, quantity, isQuery: false };
}

export function formatAmount(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
