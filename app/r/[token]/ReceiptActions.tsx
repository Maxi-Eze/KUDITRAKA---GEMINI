'use client';

import { useState } from 'react';
import { Download, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Save the receipt: the PDF, or (on a phone) share the picture. */
export function ReceiptActions({ pdfUrl, imageUrl, receiptNo }: { pdfUrl: string; imageUrl: string; receiptNo: string }) {
  const [busy, setBusy] = useState(false);

  const share = async () => {
    setBusy(true);
    try {
      const res = await fetch(imageUrl);
      const file = new File([await res.blob()], `receipt-${receiptNo}.jpg`, { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        window.open(imageUrl, '_blank', 'noopener');
      }
    } catch {
      // closed the share menu
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid w-full grid-cols-2 gap-2">
      <Button variant="outline" className="h-11" onClick={share} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
        Save picture
      </Button>
      <Button variant="outline" className="h-11" onClick={() => window.open(pdfUrl, '_blank', 'noopener')}>
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
}
