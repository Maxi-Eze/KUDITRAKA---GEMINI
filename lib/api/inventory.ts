import { client } from './client';
import type {
  BarcodeLookup,
  InventoryItem,
  ReconciliationLog,
  StockIntakeLine,
  StockReadResult,
  StockSaveLine,
  StockResult,
  StockSaveResult,
} from '@/lib/types';

export type StockSource = 'barcode' | 'photo' | 'file' | 'list';

export const inventoryApi = {
  list: () => client.get<InventoryItem[]>('/inventory'),
  create: (data: Partial<InventoryItem>) => client.post<InventoryItem>('/inventory', data),
  update: (id: string, data: Partial<InventoryItem>) => client.patch<InventoryItem>(`/inventory/${id}`, data),
  remove: (id: string) => client.delete(`/inventory/${id}`),
  reconcile: (id: string, data: { actual_stock: number; reason: string }) =>
    client.post<{ item: InventoryItem; log: ReconciliationLog }>(`/inventory/${id}/reconcile`, data),
  adjustStock: (id: string, data: { quantity: number }) =>
    client.patch<InventoryItem>(`/inventory/${id}/stock`, data),
  getLogs: () => client.get<ReconciliationLog[]>('/inventory/logs'),
  /** Start tracking an item that was just sold or bought ("Add to stock"). */
  track: (data: { name: string; stock: number; selling_price?: number | null }) =>
    client.post<InventoryItem>('/inventory/track', data),
  /** "Not a stock item": stop offering to track it. */
  ignore: (name: string) => client.post<{ name: string }>('/inventory/ignore', { name }),
  /** Read a list, a photo/PDF (base64) or spreadsheet rows into lines to check. Saves nothing. */
  read: (data: { text?: string; file?: { data: string; media_type: string }; items?: Partial<StockIntakeLine>[] }) =>
    client.post<StockReadResult>('/inventory/read', data),
  /** Add the checked lines to stock. */
  saveMany: (data: { items: StockSaveLine[]; record_expense?: boolean; source?: StockSource }) =>
    client.post<StockSaveResult>('/inventory/bulk', data),
  /** "Did you mean Milo 500g?" → Yes: take a saved sale off that item and remember the name. */
  link: (data: { transaction_id: string; item_id: string }) => client.post<StockResult>('/inventory/link', data),
  byBarcode: (code: string) => client.get<BarcodeLookup>(`/inventory/barcode/${encodeURIComponent(code)}`),
};
