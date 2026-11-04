'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/** A hidden input (password or PIN) with an eye button to check what was typed. */
function PasswordInput({
  className,
  what = 'password',
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & { what?: string }) {
  const [shown, setShown] = React.useState(false);

  return (
    <div className="relative">
      <Input type={shown ? 'text' : 'password'} className={cn('pr-11', className)} {...props} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? `Hide ${what}` : `Show ${what}`}
        aria-pressed={shown}
        className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
