'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWhatsAppStatus, useLinkWhatsApp } from '@/hooks';

export function WhatsAppLink() {
  const { data: status, isLoading, isError } = useWhatsAppStatus();
  const linkMutation = useLinkWhatsApp();
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-destructive">
            Failed to load WhatsApp status. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isLinked = status?.linked === true;
  const linkedPhone = status?.phone;

  const handleSubmit = () => {
    if (!phone || phone.length < 14 || !phone.startsWith('+234')) return;
    linkMutation.mutate(phone, {
      onSuccess: () => {
        setEditing(false);
        setPhone('');
      },
    });
  };

  const handleCancel = () => {
    setPhone('');
    setEditing(false);
  };

  if (isLinked && !editing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">WhatsApp Linked</p>
              <p className="text-sm text-muted-foreground">
                Send messages to Misa AI via WhatsApp to record transactions
              </p>
            </div>
            <Badge variant="default">Linked</Badge>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Linked Number</p>
            <p className="text-sm font-medium">{linkedPhone}</p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Change Number
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isLinked ? 'Change Linked Number' : 'Link WhatsApp'}
          </p>
          <p className="text-sm text-muted-foreground">
            Connect your WhatsApp number to record transactions via Misa AI
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="+2348012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Must be in international format starting with +234
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          {isLinked && (
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={
              !phone ||
              phone.length < 14 ||
              !phone.startsWith('+234') ||
              linkMutation.isPending
            }
          >
            {linkMutation.isPending ? 'Linking...' : 'Link WhatsApp'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}