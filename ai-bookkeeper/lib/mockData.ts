import { Transaction, Customer } from './types';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 30000,
    item: 'Rice (50kg bag)',
    customer: 'Mr Olu',
    payment_method: 'transfer',
    date: '2026-05-06',
    rawInput: 'Sold rice for 30000 to Mr Olu via transfer',
  },
  {
    id: '2',
    type: 'income',
    amount: 15000,
    item: 'Cooking Oil',
    customer: 'Mrs Adaeze',
    payment_method: 'cash',
    date: '2026-05-06',
    rawInput: 'Sold cooking oil for 15000 to Mrs Adaeze cash',
  },
  {
    id: '3',
    type: 'expense',
    amount: 8000,
    item: 'Generator Fuel',
    customer: '',
    payment_method: 'cash',
    date: '2026-05-05',
    rawInput: 'Bought generator fuel for 8000 cash',
  },
  {
    id: '4',
    type: 'income',
    amount: 45000,
    item: 'Wholesale Beans',
    customer: 'Eze Stores',
    payment_method: 'transfer',
    date: '2026-05-05',
    rawInput: 'Sold wholesale beans for 45000 to Eze Stores via transfer',
  },
  {
    id: '5',
    type: 'expense',
    amount: 20000,
    item: 'Shop Rent',
    customer: '',
    payment_method: 'transfer',
    date: '2026-05-04',
    rawInput: 'Paid shop rent 20000 via transfer',
  },
  {
    id: '6',
    type: 'income',
    amount: 12500,
    item: 'Tomato Paste',
    customer: 'Mrs Bello',
    payment_method: 'pos',
    date: '2026-05-04',
    rawInput: 'Sold tomato paste for 12500 to Mrs Bello POS',
  },
  {
    id: '7',
    type: 'expense',
    amount: 5500,
    item: 'Packaging Materials',
    customer: '',
    payment_method: 'cash',
    date: '2026-05-03',
    rawInput: 'Bought packaging materials 5500 cash',
  },
  {
    id: '8',
    type: 'income',
    amount: 22000,
    item: 'Sugar (25kg)',
    customer: 'Mr Olu',
    payment_method: 'cash',
    date: '2026-05-03',
    rawInput: 'Sold 25kg sugar for 22000 to Mr Olu cash',
  },
  {
    id: '9',
    type: 'income',
    amount: 9000,
    item: 'Palm Oil',
    customer: 'Chidi Emeka',
    payment_method: 'transfer',
    date: '2026-05-02',
    rawInput: 'Received 9000 from Chidi Emeka for palm oil via transfer',
  },
  {
    id: '10',
    type: 'expense',
    amount: 35000,
    item: 'Stock Restock (Rice)',
    customer: '',
    payment_method: 'transfer',
    date: '2026-05-02',
    rawInput: 'Paid 35000 for rice restock via transfer',
  },
  {
    id: '11',
    type: 'income',
    amount: 18000,
    item: 'Noodles Carton',
    customer: 'Eze Stores',
    payment_method: 'pos',
    date: '2026-05-01',
    rawInput: 'Sold noodles carton for 18000 to Eze Stores POS',
  },
  {
    id: '12',
    type: 'expense',
    amount: 3000,
    item: 'Electricity Bill',
    customer: '',
    payment_method: 'transfer',
    date: '2026-05-01',
    rawInput: 'Paid electricity bill 3000 via transfer',
  },
  {
    id: '13',
    type: 'income',
    amount: 27000,
    item: 'Beverages Mix',
    customer: 'Mrs Bello',
    payment_method: 'transfer',
    date: '2026-04-30',
    rawInput: 'Sold beverages mix for 27000 to Mrs Bello transfer',
  },
  {
    id: '14',
    type: 'expense',
    amount: 12000,
    item: 'Staff Salary (Part)',
    customer: '',
    payment_method: 'cash',
    date: '2026-04-30',
    rawInput: 'Paid staff partial salary 12000 cash',
  },
  {
    id: '15',
    type: 'income',
    amount: 6500,
    item: 'Groundnut Oil',
    customer: 'Chidi Emeka',
    payment_method: 'cash',
    date: '2026-04-29',
    rawInput: 'Sold groundnut oil for 6500 to Chidi Emeka cash',
  },
];

export const buildCustomers = (transactions: Transaction[]): Customer[] => {
  const map: Record<string, Customer> = {};
  transactions.forEach((t) => {
    if (!t.customer) return;
    if (!map[t.customer]) {
      map[t.customer] = {
        id: t.customer.toLowerCase().replace(/\s+/g, '-'),
        name: t.customer,
        totalTransactions: 0,
        totalAmount: 0,
        transactions: [],
      };
    }
    map[t.customer].totalTransactions += 1;
    map[t.customer].totalAmount += t.type === 'income' ? t.amount : 0;
    map[t.customer].transactions.push(t);
  });
  return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
};
