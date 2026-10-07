'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { customersApi } from '@/lib/api';
import { getFieldErrors } from '@/lib/api/errors';
import { formatCurrency, formatTxDate, cn } from '@/lib/utils';
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import {
  transactionSchema,
  PAYMENT_METHODS,
  type TransactionFormInput,
  type TransactionFormData,
} from '@/lib/validations/transaction';
import type { Transaction, PaymentMethod } from '@/lib/types';

const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  transfer: 'Transfer',
  pos: 'POS',
  card: 'Card',
  cheque: 'Cheque',
  other: 'Other',
};

const TRANSACTION_FIELDS = [
  'type',
  'amount',
  'item',
  'customer',
  'quantity',
  'payment_method',
  'date',
] as const;

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (transaction: Transaction) => void;
}

function toFormValues(transaction: Transaction): TransactionFormInput {
  return {
    type: transaction.type,
    amount: String(transaction.amount),
    item: transaction.item,
    customer: transaction.customer_name || '',
    quantity: transaction.quantity ? String(transaction.quantity) : '',
    payment_method: transaction.payment_method as PaymentMethod,
    date: transaction.date.split('T')[0],
  };
}

export function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
  onDelete,
}: TransactionDetailSheetProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const updateMutation = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<TransactionFormInput, unknown, TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      amount: '',
      item: '',
      customer: '',
      quantity: '',
      payment_method: 'cash',
      date: '',
    },
  });

  const type = watch('type');

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setMode('view');
    onOpenChange(nextOpen);
  };

  const handleEdit = () => {
    if (!transaction) return;
    reset(toFormValues(transaction));
    setMode('edit');
  };

  const handleSave = async (data: TransactionFormData) => {
    if (!transaction) return;

    let customerId: string | null = null;
    const trimmedCustomer = (data.customer || '').trim();
    if (trimmedCustomer) {
      try {
        const resolved = await customersApi.findOrCreate(trimmedCustomer);
        customerId = resolved.id;
      } catch {
        customerId = transaction.customer_id;
      }
    }

    updateMutation.mutate(
      {
        id: transaction.id,
        data: {
          type: data.type,
          amount: data.amount,
          item: data.item,
          customer_id: customerId,
          payment_method: data.payment_method,
          quantity: data.quantity,
          date: data.date,
        },
      },
      {
        onSuccess: () => {
          setMode('view');
          onOpenChange(false);
        },
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          for (const [field, message] of Object.entries(fieldErrors)) {
            const target = field === 'customer_id' ? 'customer' : field;
            if ((TRANSACTION_FIELDS as readonly string[]).includes(target)) {
              setError(target as (typeof TRANSACTION_FIELDS)[number], { message });
            }
          }
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

              {(transaction.customer_name || transaction.customer_id) && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Customer</span>
                  <span className="text-sm font-medium">
                    {transaction.customer_name || transaction.customer_id}
                  </span>
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
          <form onSubmit={handleSubmit(handleSave)} className="flex flex-col gap-4 px-4 mt-4">
            <div className="flex flex-col gap-2">
              <Label required>Type</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={type === 'income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValue('type', 'income', { shouldValidate: true })}
                >
                  Income
                </Button>
                <Button
                  type="button"
                  variant={type === 'expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValue('type', 'expense', { shouldValidate: true })}
                >
                  Expense
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-amount" required>Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                aria-required="true"
                aria-invalid={!!errors.amount}
                className={cn(errors.amount && 'border-destructive')}
                {...register('amount')}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-item" required>Item</Label>
              <Input
                id="edit-item"
                aria-required="true"
                aria-invalid={!!errors.item}
                className={cn(errors.item && 'border-destructive')}
                {...register('item')}
              />
              {errors.item && <p className="text-sm text-destructive">{errors.item.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-customer">
                Customer <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="edit-customer"
                aria-invalid={!!errors.customer}
                className={cn(errors.customer && 'border-destructive')}
                {...register('customer')}
              />
              {errors.customer && <p className="text-sm text-destructive">{errors.customer.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-quantity">
                Quantity <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                aria-invalid={!!errors.quantity}
                className={cn(errors.quantity && 'border-destructive')}
                {...register('quantity')}
              />
              {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label required>Payment Method</Label>
              <Controller
                control={control}
                name="payment_method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((pm) => (
                        <SelectItem key={pm} value={pm}>
                          {paymentLabels[pm]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-date" required>Date</Label>
              <Input
                id="edit-date"
                type="date"
                aria-required="true"
                aria-invalid={!!errors.date}
                className={cn(errors.date && 'border-destructive')}
                {...register('date')}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={updateMutation.isPending}
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
                onClick={() => setMode('view')}
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
