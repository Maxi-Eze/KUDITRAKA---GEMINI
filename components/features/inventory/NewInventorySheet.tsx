'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateItem } from '@/hooks/useInventory';
import { getFieldErrors } from '@/lib/api/errors';
import { cn } from '@/lib/utils';
import {
  inventoryItemSchema,
  type InventoryItemFormInput,
  type InventoryItemFormData,
} from '@/lib/validations/inventory';

interface NewInventorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INVENTORY_FIELDS = [
  'name',
  'category',
  'stock',
  'min_stock',
  'cost_price',
  'selling_price',
] as const;

const defaults: InventoryItemFormInput = {
  name: '',
  category: '',
  stock: '0',
  min_stock: '0',
  cost_price: '0',
  selling_price: '0',
};

export function NewInventorySheet({ open, onOpenChange }: NewInventorySheetProps) {
  const createMutation = useCreateItem();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<InventoryItemFormInput, unknown, InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: defaults,
  });

  const onSubmit = (data: InventoryItemFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset(defaults);
        onOpenChange(false);
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if ((INVENTORY_FIELDS as readonly string[]).includes(field)) {
            setError(field as (typeof INVENTORY_FIELDS)[number], { message });
          }
        }
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Add Inventory Item</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" required>Name</Label>
            <Input
              id="name"
              placeholder="e.g. Rice"
              aria-required="true"
              aria-invalid={!!errors.name}
              className={cn(errors.name && 'border-destructive')}
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category" required>Category</Label>
            <Input
              id="category"
              placeholder="e.g. Food"
              aria-required="true"
              aria-invalid={!!errors.category}
              className={cn(errors.category && 'border-destructive')}
              {...register('category')}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                aria-invalid={!!errors.stock}
                className={cn(errors.stock && 'border-destructive')}
                {...register('stock')}
              />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="minStock">Min Stock</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                aria-invalid={!!errors.min_stock}
                className={cn(errors.min_stock && 'border-destructive')}
                {...register('min_stock')}
              />
              {errors.min_stock && <p className="text-sm text-destructive">{errors.min_stock.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                aria-invalid={!!errors.cost_price}
                className={cn(errors.cost_price && 'border-destructive')}
                {...register('cost_price')}
              />
              {errors.cost_price && <p className="text-sm text-destructive">{errors.cost_price.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                aria-invalid={!!errors.selling_price}
                className={cn(errors.selling_price && 'border-destructive')}
                {...register('selling_price')}
              />
              {errors.selling_price && <p className="text-sm text-destructive">{errors.selling_price.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Saving...' : 'Save Item'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
