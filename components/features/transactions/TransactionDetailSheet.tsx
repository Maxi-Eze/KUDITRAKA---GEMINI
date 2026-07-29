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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUpdateTransaction } from '@/hooks/useTransactions';
import { formatCurrency, formatTxDate, cn } from '@/lib/utils';
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import type { Transaction, TransactionType, PaymentMethod } from '@/lib/types';

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'pos', label: 'POS' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
  onDelete,
}: TransactionDetailSheetProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const updateMutation = useUpdateTransaction();

  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');

  const resetForm = () => {
    if (!transaction) return;
    const amt = typeof transaction.amount === 'string' ? transaction.amount : transaction.amount.toString();
    setType(transaction.type);
    setAmount(amt);
    setItem(transaction.item);
    setCustomer(transaction.customer_id || '');
    setPaymentMethod(transaction.payment_method as PaymentMethod);
    setQuantity(transaction.quantity?.toString() || '');
    setDate(transaction.date.split('T')[0]);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMode('view');
    }
    onOpenChange(open);
  };

  const handleEdit = () => {
    resetForm();
    setMode('edit');
  };

  const handleCancel = () => {
    setMode('view');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || !amount || !item) return;

    updateMutation.mutate(
      {
        id: transaction.id,
        data: {
          type,
          amount: parseFloat(amount),
          item,
          customer_id: customer || null,
          payment_method: paymentMethod,
          quantity: quantity ? parseInt(quantity) : undefined,
          date: new Date(date).toISOString(),
        },
      },
      {
        onSuccess: () => {
          setMode('view');
          onOpenChange(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (transaction && onDelete) {
      onDelete(transaction);
      onOpenChange(false);
    }
  };

  if (!transaction) return null;

  const displayAmount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>
            {mode === 'edit' ? 'Edit Transaction' : 'Transaction Details'}
          </SheetTitle>
        </SheetHeader>

        {mode === 'view' ? (
          <div className="flex flex-col gap-4 px-4 mt-4">
            <div className="flex items-center gap-2">
              <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                {transaction.type}
              </Badge>
              <span className={cn(
                'text-lg font-bold',
                transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'
              )}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(displayAmount)}
              </span>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Item</span>
                <span className="text-sm font-medium">{transaction.item}</span>
              </div>

              {transaction.customer_id && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Customer</span>
                  <span className="text-sm font-medium">{transaction.customer_id}</span>
                </div>
              )}

              {transaction.quantity && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <span className="text-sm font-medium">{transaction.quantity}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="text-sm font-medium capitalize">{transaction.payment_method}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium">{formatTxDate(transaction.date)}</span>
              </div>

              {transaction.raw_input && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Raw Input</span>
                  <span className="text-sm font-medium italic">{transaction.raw_input}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={handleEdit} className="flex-1">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4 px-4 mt-4">
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
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-item">Item</Label>
              <Input
                id="edit-item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-customer">Customer (optional)</Label>
              <Input
                id="edit-customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-quantity">Quantity (optional)</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
              >
                <SelectTrigger>
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
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={!amount || !item || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
