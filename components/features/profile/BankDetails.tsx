'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useUpdateProfile, useUser } from '@/hooks/useAuth';
import { getFieldErrors } from '@/lib/api/errors';

/** The owner's bank account, added to debt reminders so customers know where to pay. */
export function BankDetails() {
  const { data: user } = useUser();
  const updateMutation = useUpdateProfile();

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setBankName(user.bankName || '');
      setAccountNumber(user.bankAccountNumber || '');
      setAccountName(user.bankAccountName || '');
    }
  }, [user]);

  // Staff can't change where customers pay. Undefined means the server can't save these yet.
  if (!user || user.staff || user.bankName === undefined) return null;

  const handleSave = () => {
    if (accountNumber && !/^\d{10}$/.test(accountNumber)) {
      setError('Account number must be 10 digits');
      return;
    }
    setError(null);
    updateMutation.mutate(
      {
        bank_name: bankName.trim() || null,
        bank_account_number: accountNumber || null,
        bank_account_name: accountName.trim() || null,
      },
      {
        onError: (err) => {
          const first = Object.values(getFieldErrors(err))[0];
          setError(first || (err as Error).message || 'Could not save bank details');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where customers pay you</CardTitle>
        <CardDescription>Misa adds this to debt reminders, so customers know where to send money.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="bank-name">Bank</FieldLabel>
            <Input
              id="bank-name"
              className="h-11 sm:h-10"
              placeholder="e.g. GTBank, Opay, Moniepoint"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="bank-account-number">Account number</FieldLabel>
            <Input
              id="bank-account-number"
              className="h-11 sm:h-10"
              inputMode="numeric"
              placeholder="10 digits"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="bank-account-name">Account name</FieldLabel>
            <Input
              id="bank-account-name"
              className="h-11 sm:h-10"
              placeholder="Name on the account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <FieldDescription>Leave all three empty to stop showing an account in reminders.</FieldDescription>
          </Field>
        </FieldGroup>

        <div className="mt-6 flex">
          <Button className="h-11 w-full sm:h-10 sm:w-auto" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save bank details'}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
