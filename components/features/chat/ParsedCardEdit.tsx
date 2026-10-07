'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { parsedTransactionSchema } from '@/lib/validations/transaction';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parsedTransactionSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSave({
      ...parsed,
      type: result.data.type,
      amount: result.data.amount,
      item: result.data.item,
      customer: result.data.customer || '',
      quantity: result.data.quantity,
      payment_method: result.data.payment_method,
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

        <div className="flex flex-col gap-1 items-end">
          <div className="flex justify-between items-center w-full">
            <Label className="text-sm text-muted-foreground">Amount</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              aria-invalid={!!errors.amount}
              className={cn('h-8 w-32 text-right', errors.amount && 'border-destructive')}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex justify-between items-center w-full">
            <Label className="text-sm text-muted-foreground">Item</Label>
            <Input
              value={formData.item}
              aria-invalid={!!errors.item}
              className={cn('h-8 w-48', errors.item && 'border-destructive')}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
            />
          </div>
          {errors.item && <p className="text-xs text-destructive">{errors.item}</p>}
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex justify-between items-center w-full">
            <Label className="text-sm text-muted-foreground">Quantity</Label>
            <Input
              type="number"
              min="0"
              value={formData.quantity}
              placeholder="Optional"
              aria-invalid={!!errors.quantity}
              className={cn('h-8 w-24', errors.quantity && 'border-destructive')}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex justify-between items-center w-full">
            <Label className="text-sm text-muted-foreground">Customer</Label>
            <Input
              value={formData.customer || ''}
              aria-invalid={!!errors.customer}
              className={cn('h-8 w-48', errors.customer && 'border-destructive')}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            />
          </div>
          {errors.customer && <p className="text-xs text-destructive">{errors.customer}</p>}
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
