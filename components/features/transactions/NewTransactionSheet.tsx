'use client';

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
import { useCreateTransaction } from '@/hooks/useTransactions';
import { customersApi } from '@/lib/api';
import { getFieldErrors } from '@/lib/api/errors';
import { cn } from '@/lib/utils';
import {
  transactionSchema,
  PAYMENT_METHODS,
  type TransactionFormInput,
  type TransactionFormData,
} from '@/lib/validations/transaction';
import type { PaymentMethod } from '@/lib/types';

interface NewTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

function getDefaults(): TransactionFormInput {
  return {
    type: 'income',
    amount: '',
    item: '',
    customer: '',
    quantity: '',
    payment_method: 'transfer',
    date: new Date().toISOString().split('T')[0],
  };
}

export function NewTransactionSheet({ open, onOpenChange }: NewTransactionSheetProps) {
  const createMutation = useCreateTransaction();

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
    defaultValues: getDefaults(),
  });

  const type = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    let customerId: string | null = null;
    const trimmedCustomer = (data.customer || '').trim();
    if (trimmedCustomer) {
      try {
        const resolved = await customersApi.findOrCreate(trimmedCustomer);
        customerId = resolved.id;
      } catch {
        // proceed without customer id
      }
    }

    createMutation.mutate(
      {
        type: data.type,
        amount: data.amount,
        item: data.item,
        customer_id: customerId,
        payment_method: data.payment_method,
        date: data.date,
        raw_input: '',
        quantity: data.quantity,
      },
      {
        onSuccess: () => {
          reset(getDefaults());
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Add Transaction</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
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
            <Label htmlFor="amount" required>Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              aria-required="true"
              aria-invalid={!!errors.amount}
              className={cn(errors.amount && 'border-destructive')}
              {...register('amount')}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="item" required>Item</Label>
            <Input
              id="item"
              placeholder="e.g. Rice"
              aria-required="true"
              aria-invalid={!!errors.item}
              className={cn(errors.item && 'border-destructive')}
              {...register('item')}
            />
            {errors.item && <p className="text-sm text-destructive">{errors.item.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="customer">
              Customer <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="customer"
              placeholder="e.g. Mr Olu"
              aria-invalid={!!errors.customer}
              className={cn(errors.customer && 'border-destructive')}
              {...register('customer')}
            />
            {errors.customer && <p className="text-sm text-destructive">{errors.customer.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label required>Payment Method</Label>
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
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
            <Label htmlFor="date" required>Date</Label>
            <Input
              id="date"
              type="date"
              aria-required="true"
              aria-invalid={!!errors.date}
              className={cn(errors.date && 'border-destructive')}
              {...register('date')}
            />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Saving...' : 'Save Transaction'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
