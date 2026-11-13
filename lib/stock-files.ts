import type { StockIntakeLine } from './types';

/**
 * Turning the trader's files into stock lines, on their own device:
 * Excel (.xlsx) and CSV are read here; photos are shrunk and PDFs passed on for Misa to read.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// ─────────────────────────────────────────────
// Photos and PDFs → base64 for the server
// ─────────────────────────────────────────────

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** A phone photo shrunk to at most 1600px (sharp enough to read, small enough to send on 3G). */
const shrinkImage = async (file: File, maxSide = 1600): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not read the photo'))), 'image/jpeg', 0.85)
  );
};

export async function fileForReading(file: File): Promise<{ data: string; media_type: string }> {
  if (file.type === 'application/pdf') {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('That PDF is too big. Use one under 5 MB.');
    return { data: await toBase64(file), media_type: 'application/pdf' };
  }
  if (file.type.startsWith('image/')) {
    const small = await shrinkImage(file);
    return { data: await toBase64(small), media_type: 'image/jpeg' };
  }
  throw new Error('Use a photo or a PDF.');
}

// ─────────────────────────────────────────────
// Spreadsheets (.xlsx / .csv) → rows → stock lines
// ─────────────────────────────────────────────

/** Split CSV text into rows, handling quotes ("Rice, 50kg",10). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const delimiter = (text.split('\n')[0].match(/;/g)?.length ?? 0) > (text.split('\n')[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c));
}

/** The first sheet of an .xlsx file as rows of text. */
export async function readXlsx(buffer: ArrayBuffer): Promise<string[][]> {
  const { unzipSync, strFromU8 } = await import('fflate');
  const files = unzipSync(new Uint8Array(buffer));
  const xml = (path: string) => (files[path] ? new DOMParser().parseFromString(strFromU8(files[path]), 'application/xml') : null);

  const shared = Array.from(xml('xl/sharedStrings.xml')?.getElementsByTagName('si') ?? []).map((si) =>
    Array.from(si.getElementsByTagName('t')).map((t) => t.textContent ?? '').join('')
  );
  const sheetPath = Object.keys(files).filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/.test(p)).sort()[0];
  const sheet = sheetPath ? xml(sheetPath) : null;
  if (!sheet) throw new Error('This file has no sheet we can read.');

  const colIndex = (ref: string) =>
    (ref.match(/^[A-Z]+/)?.[0] ?? 'A').split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
  return Array.from(sheet.getElementsByTagName('row'))
    .map((r) => {
      const out: string[] = [];
      for (const c of Array.from(r.getElementsByTagName('c'))) {
        const type = c.getAttribute('t');
        const v = c.getElementsByTagName('v')[0]?.textContent ?? '';
        const text =
          type === 's' ? shared[Number(v)] ?? '' : type === 'inlineStr' ? c.getElementsByTagName('t')[0]?.textContent ?? '' : v;
        out[colIndex(c.getAttribute('r') ?? 'A')] = text.trim();
      }
      return Array.from(out, (x) => x ?? '');
    })
    .filter((r) => r.some((c) => c));
}

const HEADERS: Record<keyof Omit<StockIntakeLine, 'free'>, RegExp> = {
  name: /^(item|items|name|product|products|description|goods|item name|product name)$/i,
  quantity: /^(qty|quantity|stock|units?|count|no\.?|number|pcs|in stock|amount in stock)$/i,
  unit_cost: /^(cost|cost price|unit cost|buying price|purchase price|cp|price paid|rate)$/i,
  selling_price: /^(selling price|sale price|retail price|sp|price|selling)$/i,
  barcode: /^(barcode|bar code|code|sku|ean|upc)$/i,
};

const num = (s: string | undefined): number | null => {
  if (!s) return null;
  const n = Number(String(s).replace(/[₦,\s]|ngn|naira/gi, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Rows → stock lines. Uses the header row when it names the columns, else name | quantity | cost | price. */
export function rowsToLines(rows: string[][]): StockIntakeLine[] {
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const find = (key: keyof typeof HEADERS) => header.findIndex((h) => HEADERS[key].test(h));
  let cols = { name: find('name'), quantity: find('quantity'), unit_cost: find('unit_cost'), selling_price: find('selling_price'), barcode: find('barcode') };
  let body = rows.slice(1);
  if (cols.name < 0) {
    cols = { name: 0, quantity: 1, unit_cost: 2, selling_price: 3, barcode: -1 };
    body = rows;
  }
  return body
    .map((r) => ({
      name: (r[cols.name] ?? '').trim(),
      quantity: cols.quantity >= 0 ? (num(r[cols.quantity]) != null ? Math.round(num(r[cols.quantity])!) : null) : null,
      unit_cost: cols.unit_cost >= 0 ? num(r[cols.unit_cost]) : null,
      selling_price: cols.selling_price >= 0 ? num(r[cols.selling_price]) : null,
      barcode: cols.barcode >= 0 ? (r[cols.barcode] ?? '').trim() || null : null,
    }))
    .filter((l) => l.name && /[a-z]/i.test(l.name))
    .slice(0, 200);
}

export async function readSpreadsheet(file: File): Promise<StockIntakeLine[]> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That file is too big. Use one under 5 MB.');
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv') || file.type === 'text/csv') return rowsToLines(parseCsv(await file.text()));
  if (name.endsWith('.xlsx')) return rowsToLines(await readXlsx(await file.arrayBuffer()));
  if (name.endsWith('.xls')) throw new Error('Old Excel files (.xls) can’t be read. In Excel, choose Save As → .xlsx or .csv.');
  throw new Error('Use an Excel (.xlsx) or CSV file.');
}
