'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useUpdateProfile, useUser } from '@/hooks/useAuth';
import { getFieldErrors } from '@/lib/api/errors';

/** The business address printed on receipts the business gives its customers. */
export function ReceiptAddress() {
  const { data: user } = useUser();
  const updateMutation = useUpdateProfile();
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setAddress(user.businessAddress || '');
  }, [user]);

  // Owners only. Undefined means the server can't save it yet (receipts not live).
  if (!user || user.staff || user.businessAddress === undefined) return null;

  const handleSave = () => {
    setError(null);
    updateMutation.mutate(
      { business_address: address.trim() || null },
      {
        onError: (err) => {
          const first = Object.values(getFieldErrors(err))[0];
          setError(first || (err as Error).message || 'Could not save the address');
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address on your receipts</CardTitle>
        <CardDescription>Printed on receipts you give your customers, with your phone number.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="business-address">Business address</FieldLabel>
            <Input
              id="business-address"
              className="h-11 sm:h-10"
              placeholder="e.g. 12 Allen Avenue, Ikeja"
              maxLength={200}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <FieldDescription>Leave empty to show only your phone number.</FieldDescription>
          </Field>
        </FieldGroup>
        <div className="mt-6 flex">
          <Button className="h-11 w-full sm:h-10 sm:w-auto" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save address'}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
