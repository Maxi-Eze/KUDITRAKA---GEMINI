'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUpdateProfile, useUser } from '@/hooks/useAuth';
import { getFieldErrors } from '@/lib/api/errors';
import type { BusinessSector } from '@/lib/types';

const sectors: { value: BusinessSector; label: string }[] = [
  { value: 'Retail & Trade', label: 'Retail & Trade' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Food & Catering', label: 'Food & Catering' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Other', label: 'Other' },
];

export function BusinessSettings() {
  const { data: user } = useUser();
  const updateMutation = useUpdateProfile();

  const [sector, setSector] = useState<BusinessSector | ''>('');
  const [inventoryEnabled, setInventoryEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSector(user.businessSector || '');
      setInventoryEnabled(user.inventoryEnabled);
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    if (!sector) return;
    setError(null);

    updateMutation.mutate(
      {
        business_sector: sector,
        inventory_enabled: inventoryEnabled,
      },
      {
        onError: (err) => {
          const fieldErrors = getFieldErrors(err);
          const first = Object.values(fieldErrors)[0];
          setError(first || (err as Error).message || 'Failed to save settings');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business settings</CardTitle>
        <CardDescription>Set your business sector and inventory preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label required>Business Sector</Label>
          <Select value={sector} onValueChange={(val) => setSector(val as BusinessSector)}>
            <SelectTrigger className="min-h-11 w-full sm:min-h-0">
              <SelectValue placeholder="Select your sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div className="space-y-1">
            <Label htmlFor="inventory-toggle" className="text-base">Enable Inventory Tracking</Label>
            <p className="text-sm text-muted-foreground">
              Track your stock levels and get low-stock alerts
            </p>
          </div>
          <Switch
            id="inventory-toggle"
            checked={inventoryEnabled}
            onCheckedChange={setInventoryEnabled}
          />
        </div>

        <div className="flex">
          <Button
            className="h-11 w-full sm:h-8 sm:w-auto"
            onClick={handleSave}
            disabled={!sector || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
