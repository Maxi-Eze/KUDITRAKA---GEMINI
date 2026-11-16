'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Copy, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiFileUrl, receiptsApi, type MadeReceipt } from '@/lib/api/receipts';

const WAIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.6A8.4 8.4 0 1 1 21 11.5z" />
  </svg>
);

/**
 * A branded receipt for one or more sales, made only when the business taps "Receipt".
 * Shows the receipt picture and lets them send it: on a phone the picture goes straight into
 * WhatsApp through the share menu; elsewhere WhatsApp opens with the private link.
 */
export function ReceiptDialog({
  transactionIds,
  open,
  onOpenChange,
}: {
  transactionIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const make = useMutation({ mutationFn: () => receiptsApi.make(transactionIds) });
  const [sharing, setSharing] = useState(false);
  const receipt: MadeReceipt | undefined = make.data;
  const key = transactionIds.join(',');

  useEffect(() => {
    if (open && !make.data && !make.isPending) make.mutate();
    // make a fresh receipt when the dialog opens for other sales
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, key]);

  useEffect(() => {
    if (!open) make.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const message = receipt ? `Here is your receipt from ${receipt.business_name}: ${receipt.url}` : '';

  const sendOnWhatsApp = async () => {
    if (!receipt) return;
    setSharing(true);
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : undefined;
      if (nav?.share && nav.canShare) {
        const res = await fetch(apiFileUrl(receipt.image_url));
        const file = new File([await res.blob()], `receipt-${receipt.receipt_no}.jpg`, { type: 'image/jpeg' });
        if (nav.canShare({ files: [file] })) {
          await nav.share({ files: [file], text: message });
          return;
        }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    } finally {
      setSharing(false);
    }
  };

  const copyLink = async () => {
    if (!receipt) return;
    try {
      await navigator.clipboard.writeText(receipt.url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy. Please copy it by hand.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>Send it to your customer. It carries your business name and our logo.</DialogDescription>
        </DialogHeader>

        {make.isPending && (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Making the receipt...
          </div>
        )}
        {make.isError && <p className="text-sm text-destructive">{(make.error as Error).message || 'Could not make the receipt. Please try again.'}</p>}

        {receipt && (
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={apiFileUrl(receipt.image_url)} alt={`Receipt ${receipt.receipt_no} from ${receipt.business_name}, total ${receipt.total}`} className="w-full rounded-xl border border-border" />
            <div className="grid gap-2">
              <Button className="h-11 bg-[#25D366] text-white hover:bg-[#1fb957]" onClick={sendOnWhatsApp} disabled={sharing}>
                {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <WAIcon />}
                Send on WhatsApp
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-11" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                  Copy link
                </Button>
                <Button variant="outline" className="h-11" onClick={() => window.open(apiFileUrl(receipt.pdf_url), '_blank', 'noopener')}>
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
