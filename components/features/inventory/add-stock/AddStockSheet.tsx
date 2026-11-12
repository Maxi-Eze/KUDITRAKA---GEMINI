'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Camera, FileSpreadsheet, Keyboard, ListPlus, Loader2, Mic, MicOff, ScanBarcode } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useAuth';
import { queryKeys } from '@/hooks/keys';
import { hasRight } from '@/lib/permissions';
import { inventoryApi, type StockSource } from '@/lib/api/inventory';
import { ApiError } from '@/lib/api/client';
import { fileForReading, readSpreadsheet } from '@/lib/stock-files';
import type { StockReadResult, StockSaveLine } from '@/lib/types';
import { BarcodeScanner } from './BarcodeScanner';
import { CheckStockList, toCheckRow, type CheckRow } from './CheckStockList';

type Step = 'choose' | 'reading' | 'scan' | 'list' | 'check';

interface AddStockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "Type one item by hand" opens the usual Add Item form. */
  onManual: () => void;
}

/** The server's own words for things the trader can fix (4xx); a plain fallback for anything else. */
const errorText = (e: unknown, fallback: string) =>
  e instanceof ApiError ? (e.status < 500 ? e.message : fallback) : e instanceof Error && e.message ? e.message : fallback;

export function AddStockSheet({ open, onOpenChange, onManual }: AddStockSheetProps) {
  const { data: user } = useUser();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>('choose');
  const [source, setSource] = useState<StockSource>('list');
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [read, setRead] = useState<Pick<StockReadResult, 'supplier' | 'unreadable'>>({ supplier: null, unreadable: [] });
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [listening, setListening] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const speech = useRef<any>(null);
  // Charging on: the server asks before reading a receipt ("Reading this receipt uses 30 credits. Go ahead?").
  const [askCredits, setAskCredits] = useState<{ message: string; again: () => void } | null>(null);

  const reset = () => {
    speech.current?.stop?.();
    setStep('choose');
    setRows([]);
    setText('');
    setRead({ supplier: null, unreadable: [] });
  };
  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const showResult = (result: StockReadResult) => {
    setRows(result.items.map(toCheckRow));
    setRead({ supplier: result.supplier, unreadable: result.unreadable });
    setStep('check');
  };

  const readWith = async (
    from: StockSource,
    run: (confirmCredits: boolean) => Promise<StockReadResult>,
    back: Step = 'choose',
    confirmCredits = false,
  ) => {
    setSource(from);
    setStep('reading');
    try {
      showResult(await run(confirmCredits));
    } catch (e) {
      if (e instanceof ApiError && e.status === 428) {
        setStep(back);
        setAskCredits({ message: e.message, again: () => readWith(from, run, back, true) });
        return;
      }
      toast.error(errorText(e, "Couldn't read that. Please try again."));
      setStep(back);
    }
  };

  const onPhoto = (file?: File) => {
    if (!file) return;
    readWith('photo', async (confirm_credits) => inventoryApi.read({ file: await fileForReading(file), confirm_credits }));
  };

  const onFile = (file?: File) => {
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      readWith('file', async (confirm_credits) => inventoryApi.read({ file: await fileForReading(file), confirm_credits }));
    } else {
      readWith('file', async () => {
        const lines = await readSpreadsheet(file);
        if (!lines.length) throw new Error('No items found in that file. The first column should be the item name.');
        return inventoryApi.read({ items: lines });
      });
    }
  };

  const onBarcode = async (code: string) => {
    const already = rows.find((r) => r.barcode === code);
    if (already) {
      setRows((rs) => rs.map((r) => (r.key === already.key ? { ...r, quantity: String((Number(r.quantity) || 0) + 1) } : r)));
      return;
    }
    setLookingUp(true);
    try {
      const found = await inventoryApi.byBarcode(code);
      const line = { name: found.item?.name ?? found.suggested_name ?? '', quantity: 1, unit_cost: null, selling_price: null, barcode: code };
      setRows((rs) => [
        ...rs,
        toCheckRow({ ...line, match: found.item ? { type: 'exact', item: found.item } : { type: 'new' } }),
      ]);
      toast.success(found.item ? `${found.item.name}: +1` : found.suggested_name ? `${found.suggested_name} (new)` : 'New item: name it on the next screen');
    } catch (e) {
      toast.error(errorText(e, "Couldn't look up that barcode."));
    } finally {
      setLookingUp(false);
    }
  };

  const toggleSpeech = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      toast.error('Speaking a list works in Chrome. You can type it instead.');
      return;
    }
    if (listening) {
      speech.current?.stop();
      return;
    }
    const rec = new Recognition();
    rec.lang = 'en-NG';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const said = Array.from(e.results as ArrayLike<any>)
        .slice(e.resultIndex)
        .map((r: any) => r[0].transcript.trim())
        .join(', ');
      if (said) setText((t) => (t.trim() ? `${t.trim()}, ${said}` : said));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    speech.current = rec;
    rec.start();
    setListening(true);
  };

  const save = async (lines: StockSaveLine[], recordExpense: boolean) => {
    setSaving(true);
    try {
      const result = await inventoryApi.saveMany({ items: lines, record_expense: recordExpense, source });
      const parts = [
        result.added.length && `${result.added.length} new ${result.added.length === 1 ? 'item' : 'items'} added`,
        result.restocked.length && `${result.restocked.length} restocked`,
        result.expenses_recorded && `${result.expenses_recorded} ${result.expenses_recorded === 1 ? 'expense' : 'expenses'} recorded`,
      ].filter(Boolean);
      toast.success(parts.join(' · ') || 'Stock updated');
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      if (result.expenses_recorded) {
        qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
        qc.invalidateQueries({ queryKey: queryKeys.reports.all });
      }
      close(false);
    } catch (e) {
      toast.error(errorText(e, "Couldn't add the stock. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const options = [
    { icon: ScanBarcode, title: 'Scan barcodes', hint: 'Packaged goods: point the camera, one after another', run: () => { setSource('barcode'); setRows([]); setStep('scan'); } },
    { icon: Camera, title: 'Photo', hint: "Supplier's invoice, your stock notebook, or one product", run: () => photoInput.current?.click() },
    { icon: FileSpreadsheet, title: 'Upload a file', hint: 'Excel, CSV or a PDF invoice', run: () => fileInput.current?.click() },
    { icon: ListPlus, title: 'Type or say a list', hint: '"Indomie 20, Milo 10 @ 1500"', run: () => setStep('list') },
    { icon: Keyboard, title: 'Add one item by hand', hint: 'Name, prices and how many', run: () => { close(false); onManual(); } },
  ];

  return (
    <>
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add stock</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx,.csv,.pdf,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }}
          />

          {step === 'choose' && (
            <div className="flex flex-col gap-2">
              <p className="mb-1 text-sm text-muted-foreground">Pick the easiest way. You check everything before it&apos;s saved.</p>
              {options.map((o) => (
                <button
                  key={o.title}
                  type="button"
                  onClick={o.run}
                  className="flex items-center gap-3 rounded-lg border border-input p-3 text-left transition-colors hover:bg-muted"
                >
                  <o.icon className="h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <span className="block text-sm font-medium">{o.title}</span>
                    <span className="block text-xs text-muted-foreground">{o.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 'reading' && (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Misa is reading your stock...
            </div>
          )}

          {step === 'scan' && (
            <div className="flex flex-col gap-4">
              <BarcodeScanner onCode={onBarcode} busy={lookingUp} />
              {rows.length > 0 && (
                <ul className="divide-y divide-border rounded-lg border border-border text-sm">
                  {rows.map((r) => (
                    <li key={r.key} className="flex justify-between gap-2 px-3 py-2">
                      <span className="truncate">{r.name || <span className="text-muted-foreground">New item (name it next)</span>}</span>
                      <span className="text-muted-foreground">{`× ${r.quantity}`}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>
                  Back
                </Button>
                <Button className="flex-1" disabled={!rows.length} onClick={() => setStep('check')}>
                  {rows.length ? `Check ${rows.length} ${rows.length === 1 ? 'item' : 'items'}` : 'Scan a barcode'}
                </Button>
              </div>
            </div>
          )}

          {step === 'list' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                One item per line, or separated by commas. Add a price with @ (each) or &quot;for&quot; (total).
              </p>
              <textarea
                className="min-h-40 w-full rounded-lg border border-input bg-transparent p-3 text-base outline-none focus-visible:border-ring"
                placeholder={'Indomie 20\nMilo 10 @ 1500\n10 bags rice for 450k'}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button variant="outline" onClick={toggleSpeech}>
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {listening ? 'Stop listening' : 'Say the list instead'}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>
                  Back
                </Button>
                <Button className="flex-1" disabled={!text.trim()} onClick={() => readWith('list', (confirm_credits) => inventoryApi.read({ text, confirm_credits }), 'list')}>
                  Read my list
                </Button>
              </div>
            </div>
          )}

          {step === 'check' && (
            <CheckStockList
              rows={rows}
              onRowsChange={setRows}
              supplier={read.supplier}
              unreadable={read.unreadable}
              canRestock={hasRight(user, 'change_stock')}
              canRecordExpense={hasRight(user, 'record_sales')}
              defaultRecordExpense={source === 'photo' || source === 'file'}
              saving={saving}
              onBack={() => setStep(source === 'barcode' ? 'scan' : source === 'list' ? 'list' : 'choose')}
              onSave={save}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
    <Dialog open={!!askCredits} onOpenChange={(o) => !o && setAskCredits(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Read it with Misa?</DialogTitle>
          <DialogDescription>{askCredits?.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAskCredits(null)}>
            Not now
          </Button>
          <Button
            onClick={() => {
              const again = askCredits?.again;
              setAskCredits(null);
              again?.();
            }}
          >
            Go ahead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
