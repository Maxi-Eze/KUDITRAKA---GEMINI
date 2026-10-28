import type { StockResult } from './types';

export interface StockNote {
  tone: 'info' | 'warning';
  text: string;
}

/**
 * Plain-language line about what a saved sale/restock did to stock
 * (same wording Misa uses on WhatsApp). Null when there is nothing to say.
 */
export function stockNote(stock?: StockResult | null): StockNote | null {
  if (!stock || stock.status !== 'updated') return null;
  const name = stock.inventory_name || stock.item;
  if (stock.oversold && stock.oversold > 0) {
    return { tone: 'warning', text: `You only had ${stock.previous} ${name} in stock, so it's now 0. Please check your count.` };
  }
  if ((stock.change ?? 0) > 0) return { tone: 'info', text: `${name} stock is now ${stock.current}.` };
  if (stock.low_stock) return { tone: 'warning', text: `Only ${stock.current} ${name} left. Time to restock?` };
  return { tone: 'info', text: `${stock.current} ${name} left in stock.` };
}

/** True when Misa should ask "Add this item to your stock?". */
export const shouldOfferTracking = (stock?: StockResult | null) =>
  !!stock && stock.status === 'not_tracked' && !!stock.should_offer_tracking;
