import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomerRow } from './CustomerRow';
import { CustomerCard } from './CustomerCard';
import { Pagination } from '@/components/ui/pagination';
import { Users, Search } from 'lucide-react';
import type { CustomerData } from '@/lib/types';

interface CustomerListProps {
  customers: CustomerData[];
  isLoading: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  hasActiveFilters: boolean;
  onCustomerClick: (customer: CustomerData) => void;
}

function SkeletonTable() {
  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Transactions</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function CustomerList({
  customers,
  isLoading,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  hasActiveFilters,
  onCustomerClick,
}: CustomerListProps) {
  if (isLoading) {
    return (
      <div>
        <SkeletonTable />
        <SkeletonCards />
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={hasActiveFilters ? Search : Users}
        title={hasActiveFilters ? 'No customers match your search' : 'No customers yet'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search criteria'
            : 'Customers will appear here as you record transactions'
        }
      />
    );
  }

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = customers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-2">
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer, index) => (
              <CustomerRow
                key={customer.name}
                customer={customer}
                rank={startIndex + index + 1}
                onClick={onCustomerClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="lg:hidden space-y-3">
        {paginatedCustomers.map((customer, index) => (
          <CustomerCard
            key={customer.name}
            customer={customer}
            rank={startIndex + index + 1}
            onClick={onCustomerClick}
          />
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
