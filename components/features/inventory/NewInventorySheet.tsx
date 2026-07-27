'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateItem } from '@/hooks/useInventory';

interface NewInventorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewInventorySheet({ open, onOpenChange }: NewInventorySheetProps) {
  const createMutation = useCreateItem();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [costPrice, setCostPrice] = useState('0');
  const [sellingPrice, setSellingPrice] = useState('0');

  const resetForm = () => {
    setName('');
    setCategory('');
    setStock('0');
    setMinStock('0');
    setCostPrice('0');
    setSellingPrice('0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;

    createMutation.mutate(
      {
        name,
        category,
        stock: parseInt(stock, 10) || 0,
        minStock: parseInt(minStock, 10) || 0,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
      },
      {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Add Inventory Item</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Rice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g. Food"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="minStock">Min Stock</Label>
            <Input
              id="minStock"
              type="number"
              min="0"
              placeholder="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="costPrice">Cost Price</Label>
            <Input
              id="costPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sellingPrice">Selling Price</Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
          </div>
        </form>
        <SheetFooter>
          <Button
            type="submit"
            disabled={!name || !category || createMutation.isPending}
          >
            {createMutation.isPending ? 'Saving...' : 'Save Item'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}