'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { TransactionFilters } from '@/components/features/transactions/TransactionFilters';
import { TransactionList } from '@/components/features/transactions/TransactionList';
import { DeleteTransactionDialog } from '@/components/features/transactions/DeleteTransactionDialog';
import { NewTransactionSheet } from '@/components/features/transactions/NewTransactionSheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Transaction } from '@/lib/types';

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const { data: rawTransactions, isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const transactions = useMemo(
    () => (Array.isArray(rawTransactions) ? rawTransactions : []),
    [rawTransactions]
  );

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, startDate, endDate, search]);

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (typeFilter !== 'all') {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.item.toLowerCase().includes(q) ||
          (tx.customer && tx.customer.toLowerCase().includes(q))
      );
    }

    if (startDate) {
      result = result.filter((tx) => tx.date >= startDate);
    }

    if (endDate) {
      result = result.filter((tx) => tx.date <= endDate);
    }

    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, search, startDate, endDate]);

  const totalItems = filteredTransactions.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + PAGE_SIZE);

  const hasActiveFilters = search !== '' || typeFilter !== 'all' || startDate !== '' || endDate !== '';

  const handleDelete = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx) {
      setDeleteTarget(tx);
      setDeleteOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <TransactionFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      <TransactionList
        transactions={paginatedTransactions}
        isLoading={isLoading}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        hasActiveFilters={hasActiveFilters}
      />

      <NewTransactionSheet open={addOpen} onOpenChange={setAddOpen} />

      <DeleteTransactionDialog
        transaction={deleteTarget}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
