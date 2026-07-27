'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CustomerFilters } from '@/components/features/customers/CustomerFilters';
import { CustomerList } from '@/components/features/customers/CustomerList';
import { CustomerDetail } from '@/components/features/customers/CustomerDetail';
import { useCustomers } from '@/hooks/useCustomers';
import type { CustomerData } from '@/lib/types';

type SortField = 'total' | 'count' | 'name';

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('total');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { customers, isLoading } = useCustomers({ search, sortBy });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortField) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleCustomerClick = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setDetailOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Track your customers and their transactions"
      />
      <div className="space-y-4">
        <CustomerFilters
          search={search}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
        <CustomerList
          customers={customers}
          isLoading={isLoading}
          currentPage={currentPage}
          totalItems={customers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          hasActiveFilters={search.length > 0}
          onCustomerClick={handleCustomerClick}
        />
      </div>
      <CustomerDetail
        customer={selectedCustomer}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
