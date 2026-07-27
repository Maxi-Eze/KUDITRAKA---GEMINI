import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { TransactionRow } from './TransactionRow';
import { TransactionCard } from './TransactionCard';
import { Pagination } from '@/components/ui/pagination';
import { ArrowLeftRight } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  hasActiveFilters: boolean;
}

function SkeletonTable() {
  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-6" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="lg:hidden space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-3 space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionList({
  transactions,
  isLoading,
  onDelete,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  hasActiveFilters,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div>
        <SkeletonTable />
        <SkeletonCards />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title={hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search or filter criteria'
            : 'Your transactions will appear here once you record them'
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} onDelete={onDelete} />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="lg:hidden space-y-3">
        {transactions.map((tx) => (
          <TransactionCard key={tx.id} transaction={tx} onDelete={onDelete} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
