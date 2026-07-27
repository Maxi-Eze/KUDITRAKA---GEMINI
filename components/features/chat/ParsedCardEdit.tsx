'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import type { ParsedTransaction, TransactionType, PaymentMethod } from '@/lib/types';

interface ParsedCardEditProps {
  parsed: ParsedTransaction;
  onSave: (updated: ParsedTransaction) => void;
  onCancel: () => void;
}

const typeOptions: TransactionType[] = ['income', 'expense'];
const paymentOptions: PaymentMethod[] = ['cash', 'transfer', 'pos', 'card', 'cheque', 'other'];

export function ParsedCardEdit({ parsed, onSave, onCancel }: ParsedCardEditProps) {
  const [formData, setFormData] = useState({
    type: parsed.type,
    amount: parsed.amount.toString(),
    item: parsed.item,
    quantity: parsed.quantity?.toString() || '',
    customer: parsed.customer,
    payment_method: parsed.payment_method,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...parsed,
      type: formData.type,
      amount: parseFloat(formData.amount) || 0,
      item: formData.item,
      quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      customer: formData.customer,
      payment_method: formData.payment_method,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm text-muted-foreground">Type</Label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus:border-ring"
          >
            {typeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center">
          <Label className="text-sm text-muted-foreground">Amount</Label>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="h-8 w-32 text-right"
          />
        </div>

        <div className="flex justify-between items-center">
          <Label className="text-sm text-muted-foreground">Item</Label>
          <Input
            value={formData.item}
            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
            className="h-8 w-48"
          />
        </div>

        <div className="flex justify-between items-center">
          <Label className="text-sm text-muted-foreground">Quantity</Label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="h-8 w-24"
            placeholder="Optional"
          />
        </div>

        <div className="flex justify-between items-center">
          <Label className="text-sm text-muted-foreground">Customer</Label>
          <Input
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            className="h-8 w-48"
          />
        </div>

        <div className="flex justify-between items-center">
          <Label className="text-sm text-muted-foreground">Payment</Label>
          <select
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus:border-ring"
          >
            {paymentOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" className="flex-1">
          <Check className="h-4 w-4" />
          Save
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}