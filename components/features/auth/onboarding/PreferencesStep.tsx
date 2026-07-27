'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PreferencesStepProps {
  data: { inventoryEnabled: boolean };
  onChange: (data: { inventoryEnabled: boolean }) => void;
}

export function PreferencesStep({ data, onChange }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Set your preferences</h2>
        <p className="text-muted-foreground mt-1">Customize your experience</p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="inventory" className="text-base">
              Enable Inventory Tracking
            </Label>
            <p className="text-sm text-muted-foreground">
              Track your stock levels and get low-stock alerts
            </p>
          </div>
          <Switch
            id="inventory"
            checked={data.inventoryEnabled}
            onCheckedChange={(checked) => onChange({ ...data, inventoryEnabled: checked })}
          />
        </div>
      </div>
    </div>
  );
}
