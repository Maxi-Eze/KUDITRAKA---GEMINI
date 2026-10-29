'use client';

import Link from 'next/link';
import { Check, MessageSquare, Package, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { useUser } from '@/hooks/useAuth';
import { useInventoryItems } from '@/hooks/useInventory';
import { useWhatsAppStatus } from '@/hooks/useWhatsApp';
import { cn } from '@/lib/utils';

interface Step {
  key: string;
  done: boolean;
  icon: typeof MessageSquare;
  title: string;
  hint: string;
  href: string;
  action: string;
}

/**
 * Shown on the dashboard until the first transaction is recorded, so a new user sees what to do
 * instead of a page of ₦0. Steps tick off as they are completed.
 */
export function GetStarted() {
  const { data: user } = useUser();
  const { data: items } = useInventoryItems();
  const { data: whatsapp } = useWhatsAppStatus();

  const firstName = (user?.ownerName || '').trim().split(/\s+/)[0];
  const steps: Step[] = [
    {
      key: 'sale',
      done: false, // the card disappears once the first sale is recorded
      icon: MessageSquare,
      title: 'Record your first sale',
      hint: 'Type it like a text message, e.g. "Sold 2 bags of rice for 50k".',
      href: '/chat',
      action: 'Open chat',
    },
    ...(user?.inventoryEnabled
      ? [{
          key: 'stock',
          done: Array.isArray(items) && items.length > 0,
          icon: Package,
          title: 'Add your stock',
          hint: 'Tell Misa what you sell so it can count it for you.',
          href: '/inventory',
          action: 'Add items',
        }]
      : []),
    {
      key: 'whatsapp',
      done: whatsapp?.linked === true,
      icon: Smartphone,
      title: 'Link WhatsApp',
      hint: 'Record sales by sending Misa a WhatsApp message.',
      href: '/profile?tab=whatsapp',
      action: 'Link WhatsApp',
    },
  ];

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle className="text-lg">
          {`${firstName ? `Welcome, ${firstName}!` : 'Welcome!'} Let's set up your books.`}
        </CardTitle>
        <CardDescription>Do these steps and your dashboard will fill up with your numbers.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.key} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    step.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                  aria-hidden
                >
                  {step.done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('flex items-center gap-2 text-sm font-medium', step.done && 'text-muted-foreground line-through')}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {step.title}
                  </p>
                  {!step.done && <p className="mt-0.5 text-xs text-muted-foreground">{step.hint}</p>}
                </div>
                {step.done ? (
                  <span className="shrink-0 text-xs font-medium text-primary">Done</span>
                ) : (
                  <Link href={step.href} className={cn(buttonVariants({ size: 'sm', variant: i === 0 ? 'default' : 'outline' }), 'shrink-0')}>
                    {step.action}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
