import { z } from 'zod';

export const MAX_AMOUNT = 1_000_000_000;
export const MAX_STOCK = 1_000_000;

const nonNegativeIntField = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || (!Number.isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0),
    'Enter a whole number (0 or more)'
  )
  .refine((v) => !v || Number(v) <= MAX_STOCK, 'Value is too large')
  .transform((v) => (v ? Number(v) : 0));

const nonNegativeAmountField = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Enter a valid amount')
  .refine((v) => !v || Number(v) <= MAX_AMOUNT, 'Amount is too large')
  .transform((v) => (v ? Number(v) : 0));

export const inventoryItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must be 120 characters or fewer'),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .max(60, 'Category must be 60 characters or fewer'),
  stock: nonNegativeIntField,
  min_stock: nonNegativeIntField,
  cost_price: nonNegativeAmountField,
  selling_price: nonNegativeAmountField,
});

export type InventoryItemFormInput = z.input<typeof inventoryItemSchema>;
export type InventoryItemFormData = z.output<typeof inventoryItemSchema>;

export const stockAdjustSchema = z.object({
  quantity: z
    .string()
    .trim()
    .min(1, 'Enter a quantity')
    .refine((v) => !Number.isNaN(Number(v)) && Number.isInteger(Number(v)), 'Enter a whole number')
    .refine((v) => Number(v) !== 0, 'Enter a non-zero quantity')
    .transform(Number),
});

export type StockAdjustFormInput = z.input<typeof stockAdjustSchema>;

export const reconcileSchema = z.object({
  actual_stock: z
    .string()
    .trim()
    .min(1, 'Actual count is required')
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0,
      'Enter a whole number (0 or more)'
    )
    .transform(Number),
  reason: z
    .string()
    .trim()
    .min(1, 'Reason is required')
    .max(200, 'Reason must be 200 characters or fewer'),
});

export type ReconcileFormInput = z.input<typeof reconcileSchema>;
