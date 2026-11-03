import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'icon' | 'full';
  className?: string;
}

/** The app is always dark, so the lime logo is the one that shows up. */
export function BrandLogo({ variant = 'full', className }: BrandLogoProps) {
  if (variant === 'icon') {
    return (
      <img
        src="/brand/icon-only-logo.svg"
        alt="MISA"
        className={cn('h-12 w-auto', className)}
      />
    );
  }

  return (
    <img
      src="/brand/logo.svg"
      alt="MISA"
      className={cn('h-10 w-auto', className)}
    />
  );
}
