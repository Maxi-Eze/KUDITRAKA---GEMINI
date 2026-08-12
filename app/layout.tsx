import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const satoshi = localFont({
  src: './fonts/Satoshi-Variable.ttf',
  variable: '--font-satoshi',
});

export const metadata: Metadata = {
  title: 'Kuditraka.Ai — Smart Business Finance',
  description: 'AI-powered bookkeeping for small and medium businesses. Record transactions in plain language and get real-time financial insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`font-sans ${satoshi.variable}`} suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
