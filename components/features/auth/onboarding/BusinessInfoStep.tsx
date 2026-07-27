'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BusinessInfoStepProps {
  data: { businessName: string; sector: string };
  onChange: (data: { businessName: string; sector: string }) => void;
}

export function BusinessInfoStep({ data, onChange }: BusinessInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Tell us about your business</h2>
        <p className="text-muted-foreground mt-1">This helps us personalize your experience</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business-name">Business Name</Label>
          <Input
            id="business-name"
            value={data.businessName}
            onChange={(e) => onChange({ ...data, businessName: e.target.value })}
            placeholder="e.g. Mama Ngozi Stores"
          />
        </div>
        <div className="space-y-2">
          <Label>Business Sector</Label>
          <Select value={data.sector} onValueChange={(value) => onChange({ ...data, sector: value ?? '' })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Retail & Trade">Retail & Trade</SelectItem>
              <SelectItem value="Professional Services">Professional Services</SelectItem>
              <SelectItem value="Food & Catering">Food & Catering</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
