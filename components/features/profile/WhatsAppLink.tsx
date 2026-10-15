'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { useWhatsAppStatus, useLinkWhatsApp } from '@/hooks';

export function WhatsAppLink() {
  const { data: status, isLoading, isError } = useWhatsAppStatus();
  const linkMutation = useLinkWhatsApp();
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);

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

  const showForm = !isLoading && !isError && (!isLinked || editing);

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp</CardTitle>
        <CardDescription>
          Connect your WhatsApp number to record transactions via Misa AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-32" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Failed to load WhatsApp status. Please try again.
          </p>
        ) : showForm ? (
          <FieldGroup>
            {isLinked && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Change linked number</p>
                <Badge variant="secondary">Linked</Badge>
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="whatsapp-phone">Phone number</FieldLabel>
              <Input
                id="whatsapp-phone"
                placeholder="+2348012345678"
                className="h-11 sm:h-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <FieldDescription>
                Must be in international format starting with +234
              </FieldDescription>
            </Field>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {isLinked && (
                <Button variant="outline" className="h-11 w-full sm:h-10 sm:w-auto" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              <Button
                className="h-11 w-full sm:h-10 sm:w-auto"
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
          </FieldGroup>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">WhatsApp linked</p>
                <p className="text-sm text-muted-foreground">
                  Send messages to Misa AI via WhatsApp to record transactions
                </p>
              </div>
              <Badge variant="default">Linked</Badge>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Linked number</p>
              <p className="text-sm font-medium">{linkedPhone}</p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="h-11 w-full sm:h-10 sm:w-auto"
                onClick={() => setEditing(true)}
              >
                Change number
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
