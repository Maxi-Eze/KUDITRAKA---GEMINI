'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { formatCurrency } from '@/lib/utils';
import {
  useUpdateItem,
  useAdjustStock,
  useReconcileStock,
  useReconciliationLogs,
} from '@/hooks/useInventory';
import { Loader2 } from 'lucide-react';
import type { InventoryItem } from '@/lib/types';

interface InventoryDetailProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESETS = [-10, -5, -1, 1, 5, 10];

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
  const adjustStock = useAdjustStock();
  const reconcileStock = useReconcileStock();
  const { data: logsData } = useReconciliationLogs();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [costPrice, setCostPrice] = useState('0');
  const [sellingPrice, setSellingPrice] = useState('0');
  const [customQty, setCustomQty] = useState('');
  const [reconcileStockVal, setReconcileStockVal] = useState('');
  const [reconcileReason, setReconcileReason] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setStock(String(item.stock));
      setMinStock(String(item.min_stock));
      setCostPrice(String(item.cost_price));
      setSellingPrice(String(item.selling_price));
      setReconcileStockVal(String(item.stock));
      setReconcileReason('');
    }
    setEditing(false);
    setCustomQty('');
  }, [item]);

  const itemLogs = useMemo(() => {
    if (!logsData || !item) return [];
    return (Array.isArray(logsData) ? logsData : [])
      .filter((log) => log.item_id === item.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [logsData, item]);

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
          min_stock: parseInt(minStock, 10) || 0,
          cost_price: parseFloat(costPrice) || 0,
          selling_price: parseFloat(sellingPrice) || 0,
        },
      },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handlePreset = (qty: number) => {
    adjustStock.mutate({ id: item.id, quantity: qty });
  };

  const handleCustomAdjust = () => {
    const qty = parseInt(customQty, 10);
    if (isNaN(qty) || qty === 0) return;
    adjustStock.mutate(
      { id: item.id, quantity: qty },
      { onSuccess: () => setCustomQty('') }
    );
  };

  const handleReconcile = () => {
    const val = parseInt(reconcileStockVal, 10);
    if (isNaN(val) || val < 0 || !reconcileReason.trim()) return;
    reconcileStock.mutate({
      id: item.id,
      data: { actual_stock: val, reason: reconcileReason.trim() },
    });
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
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input id="edit-stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-minStock">Min Stock</Label>
                  <Input id="edit-minStock" type="number" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-costPrice">Cost Price</Label>
                  <Input id="edit-costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-sellingPrice">Selling Price</Label>
                  <Input id="edit-sellingPrice" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!name || !category || updateMutation.isPending}>
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
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Custom"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="h-9 w-28"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustomAdjust(); }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCustomAdjust}
                    disabled={!customQty || adjustStock.isPending}
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
                      value={reconcileStockVal}
                      onChange={(e) => setReconcileStockVal(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Reason</Label>
                    <Input
                      placeholder="e.g. Damaged units"
                      value={reconcileReason}
                      onChange={(e) => setReconcileReason(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleReconcile}
                  disabled={
                    !reconcileStockVal || parseInt(reconcileStockVal) < 0 || !reconcileReason.trim() || reconcileStock.isPending
                  }
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
