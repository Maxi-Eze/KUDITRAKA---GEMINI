import type { Metadata } from 'next';
import { Inter, Chakra_Petch } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { InventoryProvider } from '@/context/InventoryContext';
import LayoutWrapper from '@/components/LayoutWrapper';
import MobileNav from '@/components/MobileNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const chakra = Chakra_Petch({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-chakra',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Kuditraka.Ai — Smart Business Finance',
  description: 'AI-powered bookkeeping for small and medium businesses. Record transactions in plain language and get real-time financial insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${chakra.variable}`}>
      <body>
        <AuthProvider>
          <InventoryProvider>
            <AppProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </AppProvider>
          </InventoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
