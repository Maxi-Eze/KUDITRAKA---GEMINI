'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useCompleteOnboarding } from '@/hooks/useAuth';
import { onboardingSchema, type OnboardingFormData } from '@/lib/validations/auth';
import type { User, BusinessSector } from '@/lib/types';

const sectors: { value: BusinessSector; label: string }[] = [
  { value: 'Retail & Trade', label: 'Retail & Trade' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Food & Catering', label: 'Food & Catering' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Other', label: 'Other' },
];

interface OnboardingFormProps {
  user: User;
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const complete = useCompleteOnboarding();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      business_sector: user.businessSector || '',
      inventory_enabled: user.inventoryEnabled,
    },
  });

  const sector = watch('business_sector');
  const inventoryEnabled = watch('inventory_enabled');

  const onSubmit = (data: OnboardingFormData) => complete.mutate(data);

  return (
    <Card className="w-full max-w-md shadow-lg shadow-black/20">
      <CardHeader className="pb-2">
        <div className="flex justify-center mb-2 lg:hidden">
          <BrandLogo variant="icon" className="h-12 w-12" />
        </div>
        <div className="text-center pt-2">
          <h2 className="text-2xl font-bold text-foreground">
            Complete your setup
          </h2>
          <p className="text-muted-foreground mt-1">
            Just two quick details so Misa can personalize your experience.
          </p>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label required>Business Sector</Label>
            <Select
              value={sector}
              onValueChange={(val) =>
                setValue('business_sector', val as BusinessSector, { shouldValidate: true })
              }
            >
              <SelectTrigger className="min-h-11 w-full">
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
            {errors.business_sector && (
              <p className="text-sm text-destructive">{errors.business_sector.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="space-y-1">
              <Label htmlFor="inventory" className="text-base">
                Enable Inventory Tracking
              </Label>
              <p className="text-sm text-muted-foreground">
                Track stock levels and get low-stock alerts
              </p>
            </div>
            <Switch
              id="inventory"
              checked={inventoryEnabled}
              onCheckedChange={(checked) => setValue('inventory_enabled', checked)}
            />
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full transition-transform hover:scale-[1.02]"
            disabled={!sector || complete.isPending}
          >
            {complete.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Finish setup'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
