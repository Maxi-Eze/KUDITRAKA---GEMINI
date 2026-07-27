'use client';

import { Toaster as SonnerToaster } from 'sonner';

interface ToasterProps {
  theme?: 'light' | 'dark' | 'system';
}

export function Toaster({ theme = 'system' }: ToasterProps) {
  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      duration={4000}
      toastOptions={{
        className: 'font-sans',
        style: {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)',
        },
      }}
      richColors
      closeButton
    />
  );
}
