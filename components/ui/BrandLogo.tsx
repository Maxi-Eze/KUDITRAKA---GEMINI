'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export function BrandLogo({ variant = 'full', className }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (variant === 'icon') {
    return (
      <img
        src="/brand/icon-only-logo.svg"
        alt="MISA"
        className={cn('h-12 w-auto', className)}
      />
    );
  }

  const dark = !mounted || resolvedTheme === 'dark';

  return (
    <img
      src={dark ? '/brand/logo.svg' : '/brand/logo-dark.svg'}
      alt="MISA"
      className={cn('h-10 w-auto', className)}
    />
  );
}
