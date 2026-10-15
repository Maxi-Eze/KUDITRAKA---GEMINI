'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';
import { ChevronDown, Info } from 'lucide-react';
import type { User } from '@/lib/types';

interface ProfileInfoProps {
  user: User;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const [open, setOpen] = useState(false);

  const rows = [
    { label: 'Address', value: user.address },
    { label: 'CAC Number', value: user.cacNumber },
    { label: 'Business Type', value: user.businessType },
    { label: 'Business Size', value: user.businessSize },
    { label: 'Sales Channel', value: user.salesChannel },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>More details</CardTitle>
        <CardDescription>Additional business information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted">
            <span>{open ? 'Hide details' : 'Show details'}</span>
            <ChevronDown
              className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <ItemGroup>
              {rows.map((row) => (
                <Item key={row.label} variant="outline">
                  <ItemContent>
                    <ItemTitle className="font-normal text-muted-foreground">{row.label}</ItemTitle>
                  </ItemContent>
                  <ItemActions className="text-sm font-medium">
                    {row.value || 'Not set'}
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" />
              These fields aren&apos;t editable yet.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
