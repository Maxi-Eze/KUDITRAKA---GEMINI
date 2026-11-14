'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/hooks/useAuth';
import { useRegularCosts, useRemoveRegularCost, useSaveRegularCost } from '@/hooks/useRegularCosts';
import { formatCurrency } from '@/lib/utils';
import type { CostEvery } from '@/lib/api/regularCosts';

const EVERY: { value: CostEvery; label: string }[] = [
  { value: 'day', label: 'Every day' },
  { value: 'week', label: 'Every week' },
  { value: 'month', label: 'Every month' },
  { value: 'year', label: 'Every year' },
];
const EVERY_SHORT: Record<CostEvery, string> = { day: 'a day', week: 'a week', month: 'a month', year: 'a year' };

/** Owner's regular costs (rent, shop fee, staff pay...), told once and counted in profit. */
export function RegularCosts() {
  const { data: user } = useUser();
  const isOwnerLogin = !!user && !user.staff;
  const { data: costs, isError } = useRegularCosts(isOwnerLogin);
  const save = useSaveRegularCost();
  const remove = useRemoveRegularCost();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [every, setEvery] = useState<CostEvery>('month');

  // Staff never see costs; before the server has it, show nothing.
  if (!isOwnerLogin || isError || !costs) return null;

  const amountNumber = Number(amount);
  const canAdd = name.trim().length > 0 && amountNumber > 0 && !save.isPending;

  const handleAdd = () => {
    if (!canAdd) return;
    save.mutate(
      { name: name.trim(), amount: amountNumber, every },
      {
        onSuccess: () => {
          setName('');
          setAmount('');
          setEvery('month');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regular costs</CardTitle>
        <CardDescription>
          What you pay again and again, like rent, shop fee or staff pay. Tell Misa once and she counts it in your profit.
          Yearly rent is spread over the months.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {costs.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {costs.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(c.amount)} {EVERY_SHORT[c.every]}
                    {c.every !== 'month' && <> · about {formatCurrency(c.per_month)} a month</>}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${c.name}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="cost-name">What is it for?</FieldLabel>
            <Input
              id="cost-name"
              className="h-11 sm:h-10"
              placeholder="e.g. Shop rent, Market levy, Staff pay"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="cost-amount">How much (₦)</FieldLabel>
              <Input
                id="cost-amount"
                className="h-11 sm:h-10"
                inputMode="numeric"
                placeholder="e.g. 600000"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cost-every">How often</FieldLabel>
              <Select items={EVERY} value={every} onValueChange={(v) => v && setEvery(v as CostEvery)}>
                <SelectTrigger id="cost-every" className="h-11 w-full sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVERY.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>
        <Button onClick={handleAdd} disabled={!canAdd}>
          {save.isPending ? 'Saving…' : 'Add cost'}
        </Button>
        <p className="text-xs text-muted-foreground">
          You can also tell Misa in chat, like &quot;My shop rent is ₦600,000 a year&quot;.
        </p>
      </CardContent>
    </Card>
  );
}
