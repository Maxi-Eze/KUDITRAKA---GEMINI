import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { LEGAL_DRAFT, LEGAL_UPDATED } from '@/lib/legal';

/** Shared frame for /privacy and /terms: readable on a phone, no sign-in needed. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2">
          <BrandLogo variant="icon" className="h-8 w-8" />
          <span className="font-semibold">Misa</span>
        </Link>

        {LEGAL_DRAFT && (
          <p className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-500">
            Draft for review. Not yet in force.
          </p>
        )}

        <h1 className="mt-6 text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>

        <div className="legal mt-8 space-y-4 text-[15px] leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-border [&_td]:py-2 [&_td]:pr-3 [&_td]:align-top [&_th]:pb-2 [&_th]:pr-3 [&_th]:text-left [&_th]:font-medium [&_th]:text-muted-foreground">
          {children}
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          {' · '}
          <Link href="/terms" className="hover:underline">Terms of Use</Link>
        </p>
      </div>
    </main>
  );
}

/** A table that scrolls sideways on its own on a narrow phone, instead of the whole page. */
export function LegalTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
