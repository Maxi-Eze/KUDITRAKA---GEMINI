'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { InventoryFilters } from '@/components/features/inventory/InventoryFilters';
import { InventoryList } from '@/components/features/inventory/InventoryList';
import { InventoryDetail } from '@/components/features/inventory/InventoryDetail';
import { NewInventorySheet } from '@/components/features/inventory/NewInventorySheet';
import { DeleteInventoryDialog } from '@/components/features/inventory/DeleteInventoryDialog';
import { useInventoryItems, useDeleteItem } from '@/hooks/useInventory';
import { Plus } from 'lucide-react';
import type { InventoryItem } from '@/lib/types';

type SortField = 'name' | 'stock' | 'selling_price' | 'category';

const PAGE_SIZE = 20;

export default function InventoryPage() {
  const { data: rawItems, isLoading } = useInventoryItems();
  const deleteMutation = useDeleteItem();

  const items = useMemo(
    () => (Array.isArray(rawItems) ? rawItems : []),
    [rawItems]
  );

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock':
        result = [...result].sort((a, b) => b.stock - a.stock);
        break;
      case 'selling_price':
        result = [...result].sort((a, b) => Number(b.selling_price) - Number(a.selling_price));
        break;
      case 'category':
        result = [...result].sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    return result;
  }, [items, search, sortBy]);

  const totalItems = filteredItems.length;
  const hasActiveFilters = search !== '';

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setDeleteTarget(item);
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
          Add Item
        </Button>
      </div>

      <InventoryFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <InventoryList
        items={filteredItems}
        isLoading={isLoading}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        hasActiveFilters={hasActiveFilters}
        onItemClick={handleItemClick}
      />

      <NewInventorySheet open={addOpen} onOpenChange={setAddOpen} />

      <InventoryDetail
        item={selectedItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <DeleteInventoryDialog
        item={deleteTarget}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}