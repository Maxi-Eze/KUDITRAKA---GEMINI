import { z } from 'zod';

export const TRANSACTION_TYPES = ['income', 'expense'] as const;
export const PAYMENT_METHODS = ['cash', 'transfer', 'pos', 'card', 'cheque', 'other'] as const;

export const MAX_AMOUNT = 1_000_000_000;

const amountField = z
  .string()
  .trim()
  .min(1, 'Amount is required')
  .refine((v) => !Number.isNaN(Number(v)), 'Enter a valid amount')
  .refine((v) => Number(v) > 0, 'Amount must be greater than 0')
  .refine((v) => Number(v) <= MAX_AMOUNT, 'Amount is too large')
  .transform((v) => Number(v));

const optionalQuantityField = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || (!Number.isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) > 0),
    'Enter a whole number greater than 0'
  )
  .transform((v) => (v ? Number(v) : undefined));

const dateField = z
  .string()
  .min(1, 'Date is required')
  .refine((v) => !Number.isNaN(new Date(v).getTime()), 'Enter a valid date');

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: amountField,
  item: z
    .string()
    .trim()
    .min(1, 'Item is required')
    .max(120, 'Item must be 120 characters or fewer'),
  customer: z.string().trim().max(100, 'Name is too long').optional(),
  quantity: optionalQuantityField,
  payment_method: z.enum(PAYMENT_METHODS),
  date: dateField,
});

export type TransactionFormInput = z.input<typeof transactionSchema>;
export type TransactionFormData = z.output<typeof transactionSchema>;

export const parsedTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: amountField,
  item: z
    .string()
    .trim()
    .min(1, 'Item is required')
    .max(120, 'Item must be 120 characters or fewer'),
  customer: z.string().trim().max(100, 'Name is too long').optional(),
  quantity: optionalQuantityField,
  payment_method: z.string().trim().min(1, 'Payment method is required'),
});

export type ParsedTransactionFormData = z.output<typeof parsedTransactionSchema>;
