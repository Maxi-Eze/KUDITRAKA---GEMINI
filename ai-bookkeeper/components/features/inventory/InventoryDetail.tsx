'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useUpdateItem } from '@/hooks/useInventory';
import type { InventoryItem } from '@/lib/types';

interface InventoryDetailProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= minStock) {
    return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">Low Stock</Badge>;
  }
  return <Badge variant="secondary" className="bg-green-500/10 text-green-500">In Stock</Badge>;
}

export function InventoryDetail({ item, open, onOpenChange }: InventoryDetailProps) {
  const updateMutation = useUpdateItem();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [costPrice, setCostPrice] = useState('0');
  const [sellingPrice, setSellingPrice] = useState('0');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setStock(String(item.stock));
      setMinStock(String(item.minStock));
      setCostPrice(String(item.costPrice));
      setSellingPrice(String(item.sellingPrice));
    }
    setEditing(false);
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    if (!name || !category) return;

    updateMutation.mutate(
      {
        id: item.id,
        data: {
          name,
          category,
          stock: parseInt(stock, 10) || 0,
          minStock: parseInt(minStock, 10) || 0,
          costPrice: parseFloat(costPrice) || 0,
          sellingPrice: parseFloat(sellingPrice) || 0,
        },
      },
      {
        onSuccess: () => {
          setEditing(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Item' : item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {editing ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-minStock">Min Stock</Label>
                  <Input
                    id="edit-minStock"
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-costPrice">Cost Price</Label>
                  <Input
                    id="edit-costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-sellingPrice">Selling Price</Label>
                  <Input
                    id="edit-sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!name || !category || updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="text-lg font-medium">{item.stock}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Min Stock</p>
                  <p className="text-lg font-medium">{item.minStock}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Cost Price</p>
                  <p className="text-lg font-medium">{formatCurrency(item.costPrice)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Selling Price</p>
                  <p className="text-lg font-medium">{formatCurrency(item.sellingPrice)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{item.category}</p>
                </div>
                <StockBadge stock={item.stock} minStock={item.minStock} />
              </div>
              {item.lastRestocked && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Last Restocked</p>
                  <p className="text-sm font-medium">{new Date(item.lastRestocked).toLocaleDateString('en-NG')}</p>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setEditing(true)}>
                Edit Item
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}