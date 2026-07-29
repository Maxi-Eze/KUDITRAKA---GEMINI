'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { customersApi } from '@/lib/api';
import type { TransactionType, PaymentMethod } from '@/lib/types';

interface NewTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'pos', label: 'POS' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

export function NewTransactionSheet({ open, onOpenChange }: NewTransactionSheetProps) {
  const createMutation = useCreateTransaction();
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const resetForm = () => {
    setType('income');
    setAmount('');
    setItem('');
    setCustomer('');
    setPaymentMethod('transfer');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !item) return;

    let customerId: string | null = null;
    if (customer) {
      try {
        const resolved = await customersApi.findOrCreate(customer);
        customerId = resolved.id;
      } catch {
        // proceed without customer ID on error
      }
    }

    createMutation.mutate(
      {
        type,
        amount: parseFloat(amount),
        item,
        customer_id: customerId,
        payment_method: paymentMethod,
        date,
        raw_input: '',
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
          <SheetTitle>Add Transaction</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('income')}
              >
                Income
              </Button>
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('expense')}
              >
                Expense
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="item">Item</Label>
            <Input
              id="item"
              placeholder="e.g. Rice"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="customer">Customer (optional)</Label>
            <Input
              id="customer"
              placeholder="e.g. Mr Olu"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!amount || !item || createMutation.isPending}
          >
            {createMutation.isPending ? 'Saving...' : 'Save Transaction'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
