'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { InventoryItem, ReconciliationLog } from '@/lib/types';
import { generateId } from '@/lib/aiParser';

interface InventoryContextType {
  items: InventoryItem[];
  reconciliationLogs: ReconciliationLog[];
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateStock: (itemId: string, quantity: number) => void; // quantity can be negative
  reconcile: (itemId: string, actualStock: number, reason: string) => void;
  deleteItem: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [reconciliationLogs, setReconciliationLogs] = useState<ReconciliationLog[]>([]);

  useEffect(() => {
    const savedItems = localStorage.getItem('ai-bk-inventory');
    const savedLogs = localStorage.getItem('ai-bk-reconciliation');
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedLogs) setReconciliationLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-bk-inventory', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('ai-bk-reconciliation', JSON.stringify(reconciliationLogs));
  }, [reconciliationLogs]);

  const addItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    setItems([...items, newItem]);
  };

  const updateStock = (itemId: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, stock: item.stock + quantity } : item
    ));
  };

  const reconcile = (itemId: string, actualStock: number, reason: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const log: ReconciliationLog = {
      id: generateId(),
      itemId,
      itemName: item.name,
      systemStock: item.stock,
      actualStock,
      difference: actualStock - item.stock,
      reason,
      timestamp: new Date().toISOString()
    };

    setReconciliationLogs([log, ...reconciliationLogs]);
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, stock: actualStock } : i
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
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
