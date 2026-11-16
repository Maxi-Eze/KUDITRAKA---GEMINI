import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { apiFileUrl, fetchPublicReceipt } from '@/lib/api/receipts';
import { ReceiptActions } from './ReceiptActions';

/**
 * A receipt a business sent its customer: misa.kuditraka.name.ng/r/<token>.
 * Public (no sign-in), shows only that receipt, never indexed. Under it, Misa's "Start free".
 */

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const receipt = await fetchPublicReceipt(token);
  if (!receipt) return { title: 'Receipt · Misa', robots: { index: false, follow: false } };
  const title = `Receipt from ${receipt.business_name}`;
  const description = `Total ${receipt.total}. Made with Misa, the business assistant on WhatsApp.`;
  const image = apiFileUrl(receipt.image_url);
  return {
    title: `${title} · Misa`,
    description,
    robots: { index: false, follow: false },
    // WhatsApp shows this picture when the link is shared.
    openGraph: { title, description, images: [{ url: image, width: 900 }], type: 'website' },
  };
}

export default async function ReceiptPage({ params }: Props) {
  const { token } = await params;
  const receipt = await fetchPublicReceipt(token);
  if (!receipt) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={apiFileUrl(receipt.image_url)}
          alt={`Receipt ${receipt.receipt_no} from ${receipt.business_name}: total ${receipt.total}, ${receipt.date_text}`}
          className="w-full rounded-3xl shadow-2xl"
        />

        <ReceiptActions pdfUrl={apiFileUrl(receipt.pdf_url)} imageUrl={apiFileUrl(receipt.image_url)} receiptNo={receipt.receipt_no} />

        <section className="w-full rounded-3xl border border-primary/40 bg-card p-6 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-12" />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            {receipt.business_name} keeps its books with Misa, the business assistant on WhatsApp.
          </p>
          <p className="mt-3 text-2xl font-black leading-tight">
            You run the business.
            <br />
            <span className="text-primary">Misa keeps track.</span>
          </p>
          <ul className="mt-4 space-y-1 text-left text-sm text-muted-foreground">
            <li>✓ Text your sales on WhatsApp, Misa writes them down</li>
            <li>✓ Know your profit, your stock and who owes you</li>
            <li>✓ Give your customers receipts like this one</li>
          </ul>
          <Link
            href="/signup"
            className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground"
          >
            Start free
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Already using Misa?{' '}
            <Link href="/" className="font-semibold text-primary underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          This receipt was made by {receipt.business_name} with Misa by Kuditraka. Questions about your purchase? Contact {receipt.business_name}.
        </p>
      </div>
    </main>
  );
}
