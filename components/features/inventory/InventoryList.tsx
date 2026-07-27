import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { InventoryRow } from './InventoryRow';
import { InventoryCard } from './InventoryCard';
import { Pagination } from '@/components/ui/pagination';
import { Package, Search } from 'lucide-react';
import type { InventoryItem } from '@/lib/types';

interface InventoryListProps {
  items: InventoryItem[];
  isLoading: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  hasActiveFilters: boolean;
  onItemClick: (item: InventoryItem) => void;
}

function SkeletonTable() {
  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
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
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-28" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InventoryList({
  items,
  isLoading,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  hasActiveFilters,
  onItemClick,
}: InventoryListProps) {
  if (isLoading) {
    return (
      <div>
        <SkeletonTable />
        <SkeletonCards />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={hasActiveFilters ? Search : Package}
        title={hasActiveFilters ? 'No inventory items match your search' : 'No inventory items yet'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search criteria'
            : 'Add your first inventory item to start tracking stock'
        }
      />
    );
  }

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-2">
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <InventoryRow
                key={item.id}
                item={item}
                onClick={onItemClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="lg:hidden space-y-3">
        {paginatedItems.map((item) => (
          <InventoryCard
            key={item.id}
            item={item}
            onClick={onItemClick}
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