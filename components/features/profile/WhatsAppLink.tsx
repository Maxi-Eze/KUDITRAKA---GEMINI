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
import { PHONE_ERROR, PHONE_HINT, toNigerianInternational } from '@/lib/phone';

export function WhatsAppLink() {
  const { data: status, isLoading, isError } = useWhatsAppStatus();
  const linkMutation = useLinkWhatsApp();
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);

  const isLinked = status?.linked === true;
  const linkedPhone = status?.phone;
  // Accept 0803…, 803…, 234… or +234…, with or without spaces; always send +234….
  const international = toNigerianInternational(phone);
  const showPhoneError = phone.replace(/\D/g, '').length >= 10 && !international;

  const handleSubmit = () => {
    if (!international) return;
    linkMutation.mutate(international, {
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
                type="tel"
                inputMode="tel"
                placeholder="0803 456 7890"
                className="h-11 sm:h-10"
                aria-invalid={showPhoneError}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <FieldDescription className={showPhoneError ? 'text-destructive' : undefined}>
                {showPhoneError ? PHONE_ERROR : `Your WhatsApp number, ${PHONE_HINT}`}
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
                disabled={!international || linkMutation.isPending}
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
