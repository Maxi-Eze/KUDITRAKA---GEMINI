'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { InventoryItem, ReconciliationLog } from '@/lib/types';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

interface InventoryContextType {
  items: InventoryItem[];
  reconciliationLogs: ReconciliationLog[];
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateStock: (itemId: string, quantity: number) => void;
  reconcile: (itemId: string, actualStock: number, reason: string) => void;
  deleteItem: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

function mapItem(raw: any): InventoryItem {
  return {
    id: raw.id,
    name: raw.name,
    stock: raw.stock,
    minStock: raw.min_stock,
    costPrice: parseFloat(raw.cost_price) || 0,
    sellingPrice: parseFloat(raw.selling_price) || 0,
    category: raw.category || 'General',
    lastRestocked: raw.last_restocked || undefined,
  };
}

function mapLog(raw: any): ReconciliationLog {
  return {
    id: raw.id,
    itemId: raw.item_id,
    itemName: raw.item_name,
    systemStock: raw.system_stock,
    actualStock: raw.actual_stock,
    difference: raw.difference,
    reason: raw.reason,
    timestamp: raw.created_at,
  };
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [reconciliationLogs, setReconciliationLogs] = useState<ReconciliationLog[]>([]);

  const loadItems = async () => {
    try {
      const res = await apiClient('/inventory');
      if (Array.isArray(res)) setItems(res.map(mapItem));
    } catch (e) {
      console.error('Failed to load inventory', e);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await apiClient('/inventory/logs');
      if (Array.isArray(res)) setReconciliationLogs(res.map(mapLog));
    } catch (e) {
      console.error('Failed to load logs', e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadItems();
      loadLogs();
    }
  }, [isLoggedIn]);

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      await apiClient('/inventory', {
        method: 'POST',
        data: {
          name: item.name,
          stock: item.stock,
          min_stock: item.minStock,
          cost_price: item.costPrice,
          selling_price: item.sellingPrice,
          category: item.category,
        },
      });
      await loadItems();
    } catch (e) {
      console.error('Failed to add item', e);
    }
  };

  const updateStock = async (itemId: string, quantity: number) => {
    try {
      await apiClient(`/inventory/${itemId}/stock`, {
        method: 'PATCH',
        data: { quantity },
      });
      await loadItems();
    } catch (e) {
      console.error('Failed to update stock', e);
    }
  };

  const reconcile = async (itemId: string, actualStock: number, reason: string) => {
    try {
      await apiClient(`/inventory/${itemId}/reconcile`, {
        method: 'POST',
        data: { actual_stock: actualStock, reason },
      });
      await loadItems();
      await loadLogs();
    } catch (e) {
      console.error('Failed to reconcile', e);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await apiClient(`/inventory/${id}`, { method: 'DELETE' });
      await loadItems();
    } catch (e) {
      console.error('Failed to delete item', e);
    }
  };

  return (
    <InventoryContext.Provider value={{
      items,
      reconciliationLogs,
      addItem,
      updateStock,
      reconcile,
      deleteItem
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
