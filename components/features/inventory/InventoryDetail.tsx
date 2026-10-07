'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Separator } from '@/components/ui/separator';
import { formatCurrency, cn } from '@/lib/utils';
import { getFieldErrors } from '@/lib/api/errors';
import {
  useUpdateItem,
  useAdjustStock,
  useReconcileStock,
  useReconciliationLogs,
} from '@/hooks/useInventory';
import { Loader2 } from 'lucide-react';
import {
  inventoryItemSchema,
  stockAdjustSchema,
  reconcileSchema,
  type InventoryItemFormInput,
  type InventoryItemFormData,
  type StockAdjustFormInput,
  type ReconcileFormInput,
} from '@/lib/validations/inventory';
import type { InventoryItem } from '@/lib/types';

interface InventoryDetailProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESETS = [-10, -5, -1, 1, 5, 10];

const INVENTORY_FIELDS = [
  'name',
  'category',
  'stock',
  'min_stock',
  'cost_price',
  'selling_price',
] as const;

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= minStock) {
    return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">Low Stock</Badge>;
  }
  return <Badge variant="secondary" className="bg-green-500/10 text-green-500">In Stock</Badge>;
}

function toEditValues(item: InventoryItem): InventoryItemFormInput {
  return {
    name: item.name,
    category: item.category,
    stock: String(item.stock),
    min_stock: String(item.min_stock),
    cost_price: String(item.cost_price),
    selling_price: String(item.selling_price),
  };
}

export function InventoryDetail({ item, open, onOpenChange }: InventoryDetailProps) {
  const updateMutation = useUpdateItem();
  const adjustStock = useAdjustStock();
  const reconcileStock = useReconcileStock();
  const { data: logsData } = useReconciliationLogs();

  const [editing, setEditing] = useState(false);

  const editForm = useForm<InventoryItemFormInput, unknown, InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: '',
      category: '',
      stock: '0',
      min_stock: '0',
      cost_price: '0',
      selling_price: '0',
    },
  });

  const adjustForm = useForm<StockAdjustFormInput, unknown, { quantity: number }>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { quantity: '' },
  });

  const reconcileForm = useForm<ReconcileFormInput, unknown, { actual_stock: number; reason: string }>({
    resolver: zodResolver(reconcileSchema),
    defaultValues: { actual_stock: '', reason: '' },
  });

  useEffect(() => {
    if (item) {
      editForm.reset(toEditValues(item));
      reconcileForm.reset({ actual_stock: String(item.stock), reason: '' });
    }
    setEditing(false);
    adjustForm.reset({ quantity: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const itemLogs = useMemo(() => {
    if (!logsData || !item) return [];
    return (Array.isArray(logsData) ? logsData : [])
      .filter((log) => log.item_id === item.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [logsData, item]);

  if (!item) return null;

  const handleSave = (data: InventoryItemFormData) => {
    updateMutation.mutate(
      { id: item.id, data },
      {
        onSuccess: () => setEditing(false),
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          for (const [field, message] of Object.entries(fieldErrors)) {
            if ((INVENTORY_FIELDS as readonly string[]).includes(field)) {
              editForm.setError(field as (typeof INVENTORY_FIELDS)[number], { message });
            }
          }
        },
      }
    );
  };

  const handlePreset = (qty: number) => {
    adjustStock.mutate({ id: item.id, quantity: qty });
  };

  const handleCustomAdjust = (data: { quantity: number }) => {
    adjustStock.mutate(
      { id: item.id, quantity: data.quantity },
      { onSuccess: () => adjustForm.reset({ quantity: '' }) }
    );
  };

  const handleReconcile = (data: { actual_stock: number; reason: string }) => {
    reconcileStock.mutate(
      { id: item.id, data: { actual_stock: data.actual_stock, reason: data.reason } },
      { onSuccess: () => reconcileForm.reset({ actual_stock: String(item.stock), reason: '' }) }
    );
  };

  const editErrors = editForm.formState.errors;
  const adjustErrors = adjustForm.formState.errors;
  const reconcileErrors = reconcileForm.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Item' : item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {editing ? (
            <form onSubmit={editForm.handleSubmit(handleSave)} className="space-y-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name" required>Name</Label>
                <Input
                  id="edit-name"
                  aria-required="true"
                  aria-invalid={!!editErrors.name}
                  className={cn(editErrors.name && 'border-destructive')}
                  {...editForm.register('name')}
                />
                {editErrors.name && <p className="text-sm text-destructive">{editErrors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-category" required>Category</Label>
                <Input
                  id="edit-category"
                  aria-required="true"
                  aria-invalid={!!editErrors.category}
                  className={cn(editErrors.category && 'border-destructive')}
                  {...editForm.register('category')}
                />
                {editErrors.category && <p className="text-sm text-destructive">{editErrors.category.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    aria-invalid={!!editErrors.stock}
                    className={cn(editErrors.stock && 'border-destructive')}
                    {...editForm.register('stock')}
                  />
                  {editErrors.stock && <p className="text-sm text-destructive">{editErrors.stock.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-minStock">Min Stock</Label>
                  <Input
                    id="edit-minStock"
                    type="number"
                    min="0"
                    aria-invalid={!!editErrors.min_stock}
                    className={cn(editErrors.min_stock && 'border-destructive')}
                    {...editForm.register('min_stock')}
                  />
                  {editErrors.min_stock && <p className="text-sm text-destructive">{editErrors.min_stock.message}</p>}
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
                    aria-invalid={!!editErrors.cost_price}
                    className={cn(editErrors.cost_price && 'border-destructive')}
                    {...editForm.register('cost_price')}
                  />
                  {editErrors.cost_price && <p className="text-sm text-destructive">{editErrors.cost_price.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-sellingPrice">Selling Price</Label>
                  <Input
                    id="edit-sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    aria-invalid={!!editErrors.selling_price}
                    className={cn(editErrors.selling_price && 'border-destructive')}
                    {...editForm.register('selling_price')}
                  />
                  {editErrors.selling_price && <p className="text-sm text-destructive">{editErrors.selling_price.message}</p>}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="text-lg font-medium">{item.stock}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Min Stock</p>
                  <p className="text-lg font-medium">{item.min_stock}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Cost Price</p>
                  <p className="text-lg font-medium">{formatCurrency(item.cost_price)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Selling Price</p>
                  <p className="text-lg font-medium">{formatCurrency(item.selling_price)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{item.category}</p>
                </div>
                <StockBadge stock={item.stock} minStock={item.min_stock} />
              </div>

              {item.last_restocked && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Last Restocked</p>
                  <p className="text-sm font-medium">{new Date(item.last_restocked).toLocaleDateString('en-NG')}</p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Stock Adjust</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((qty) => (
                    <Button
                      key={qty}
                      variant={qty < 0 ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handlePreset(qty)}
                      disabled={adjustStock.isPending}
                      className="min-w-[44px]"
                    >
                      {qty > 0 ? `+${qty}` : qty}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 items-start">
                  <div className="flex flex-col gap-1">
                    <Input
                      type="number"
                      placeholder="Custom"
                      aria-invalid={!!adjustErrors.quantity}
                      className={cn('h-9 w-28', adjustErrors.quantity && 'border-destructive')}
                      {...adjustForm.register('quantity')}
                    />
                    {adjustErrors.quantity && (
                      <p className="text-xs text-destructive">{adjustErrors.quantity.message}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={adjustForm.handleSubmit(handleCustomAdjust)}
                    disabled={adjustStock.isPending}
                  >
                    {adjustStock.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Adjust'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reconcile Stock</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Actual Count</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder={String(item.stock)}
                      aria-invalid={!!reconcileErrors.actual_stock}
                      className={cn(reconcileErrors.actual_stock && 'border-destructive')}
                      {...reconcileForm.register('actual_stock')}
                    />
                    {reconcileErrors.actual_stock && (
                      <p className="text-xs text-destructive">{reconcileErrors.actual_stock.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Reason</Label>
                    <Input
                      placeholder="e.g. Damaged units"
                      aria-invalid={!!reconcileErrors.reason}
                      className={cn(reconcileErrors.reason && 'border-destructive')}
                      {...reconcileForm.register('reason')}
                    />
                    {reconcileErrors.reason && (
                      <p className="text-xs text-destructive">{reconcileErrors.reason.message}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={reconcileForm.handleSubmit(handleReconcile)}
                  disabled={reconcileStock.isPending}
                >
                  {reconcileStock.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Reconcile Stock
                </Button>
              </div>

              {itemLogs.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Adjustments</p>
                    {itemLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between rounded-lg border p-2.5">
                        <div>
                          <p className="text-sm">
                            <span className={log.difference >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                              {log.difference >= 0 ? `+${log.difference}` : log.difference}
                            </span>
                            {' '}· {log.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.system_stock} → {log.actual_stock}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {new Date(log.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
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
