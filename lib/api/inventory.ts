import { client } from './client';
import type {
  BarcodeLookup,
  DuplicatePair,
  InventoryItem,
  MergeResult,
  ReconciliationLog,
  StockIntakeLine,
  StockReadResult,
  StockSaveLine,
  StockResult,
  StockCount,
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
  read: (data: {
    text?: string;
    file?: { data: string; media_type: string };
    items?: Partial<StockIntakeLine>[];
    /** Yes to "Reading this uses N credits. Go ahead?" (asked only when charging is on). */
    confirm_credits?: boolean;
  }) => client.post<StockReadResult>('/inventory/read', data),
  /** Add the checked lines to stock. */
  saveMany: (data: {
    items: StockSaveLine[];
    record_expense?: boolean;
    source?: StockSource;
    /** Delivery or loading paid, and a discount on the whole invoice: spread into the items' cost. */
    delivery?: number | null;
    discount?: number | null;
  }) =>
    client.post<StockSaveResult>('/inventory/bulk', data),
  /** "Did you mean Milo 500g?" → Yes: take a saved sale off that item and remember the name. */
  link: (data: { transaction_id: string; item_id: string }) => client.post<StockResult>('/inventory/link', data),
  /** Evening count: the real number for each counted item, saved together. */
  saveCount: (data: { counts: { item_id: string; actual_stock: number; reason?: string | null }[]; note?: string | null }) =>
    client.post<StockCount>('/inventory/count', data),
  counts: () => client.get<StockCount[]>('/inventory/counts'),
  /** Stock items that look like the same thing (owner only). */
  duplicates: () => client.get<DuplicatePair[]>('/inventory/duplicates'),
  /** "Not the same item": stop suggesting this pair. */
  notDuplicates: (itemIds: [string, string]) => client.post<null>('/inventory/not-duplicates', { item_ids: itemIds }),
  /** Fold `mergeIds` into `keepId`: stock adds up, history and names move over. */
  merge: (keepId: string, mergeIds: string[]) => client.post<MergeResult>(`/inventory/${keepId}/merge`, { merge_ids: mergeIds }),
  byBarcode: (code: string) => client.get<BarcodeLookup>(`/inventory/barcode/${encodeURIComponent(code)}`),
};
