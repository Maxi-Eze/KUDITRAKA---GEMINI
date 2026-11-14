'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useWhatsAppStatus } from '@/hooks';
import { misaChatUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

/**
 * "Chat with Misa on WhatsApp". Grey and unclickable until the business has linked its WhatsApp
 * number; then green, and it opens WhatsApp straight to Misa. Misa's number is never shown as text.
 */
export function ChatOnWhatsApp({ showHint = false, className }: { showHint?: boolean; className?: string }) {
  const { data: status, isLoading } = useWhatsAppStatus();
  const linked = status?.linked === true;
  const base = 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold sm:h-10 sm:w-auto';

  return (
    <div className={cn('space-y-1', className)}>
      {linked ? (
        <a
          href={misaChatUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(base, 'bg-[#25D366] text-white transition-colors hover:bg-[#1ebe5b]')}
        >
          <MessageCircle className="h-4 w-4" />
          Chat with Misa on WhatsApp
        </a>
      ) : (
        <span
          role="button"
          aria-disabled="true"
          title="Link your WhatsApp number first"
          className={cn(base, 'cursor-not-allowed select-none bg-muted text-muted-foreground')}
        >
          <MessageCircle className="h-4 w-4" />
          Chat with Misa on WhatsApp
        </span>
      )}
      {showHint && !linked && !isLoading && (
        <p className="text-xs text-muted-foreground">
          <Link href="/profile?tab=whatsapp" className="font-medium text-primary hover:underline">
            Link your WhatsApp number
          </Link>{' '}
          to start chatting with Misa.
        </p>
      )}
    </div>
  );
}
