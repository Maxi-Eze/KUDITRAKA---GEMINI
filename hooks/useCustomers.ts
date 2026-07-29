'use client';

import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import type { Transaction, CustomerData } from '@/lib/types';

type SortField = 'total' | 'count' | 'name';

interface UseCustomersOptions {
  search?: string;
  sortBy?: SortField;
}

function deriveCustomers(transactions: Transaction[]): CustomerData[] {
  const map = new Map<string, CustomerData>();

  for (const tx of transactions) {
    if (!tx.customer_id || tx.customer_id.trim() === '') continue;
    const key = tx.customer_id.trim().toLowerCase();
    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.total += amount;
      if (tx.type === 'income') existing.income += amount;
      else existing.expense += amount;
      existing.transactions.push(tx);
    } else {
      map.set(key, {
        name: tx.customer_id.trim(),
        count: 1,
        total: amount,
        income: tx.type === 'income' ? amount : 0,
        expense: tx.type === 'expense' ? amount : 0,
        transactions: [tx],
      });
    }
  }

  return Array.from(map.values());
}

function sortCustomers(customers: CustomerData[], sortBy: SortField): CustomerData[] {
  const sorted = [...customers];
  switch (sortBy) {
    case 'total':
      return sorted.sort((a, b) => b.total - a.total);
    case 'count':
      return sorted.sort((a, b) => b.count - a.count);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function useCustomers({ search = '', sortBy = 'total' }: UseCustomersOptions = {}) {
  const { data: transactions, isLoading, error } = useTransactions();

  const customers = useMemo(() => {
    if (!transactions) return [];
    const derived = deriveCustomers(transactions);
    const filtered = search
      ? derived.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      : derived;
    return sortCustomers(filtered, sortBy);
  }, [transactions, search, sortBy]);

  return { customers, isLoading, error };
}
