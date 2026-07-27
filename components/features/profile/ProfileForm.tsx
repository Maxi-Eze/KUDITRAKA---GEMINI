'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUpdateProfile, useUser } from '@/hooks/useAuth';
import { profileUpdateSchema, type ProfileUpdateFormData } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

export function ProfileForm() {
  const { data: user } = useUser();
  const updateMutation = useUpdateProfile();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.ownerName || '',
        businessName: user.businessName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        cacNumber: user.cacNumber || '',
        businessType: user.businessType || '',
        businessSize: user.businessSize || '',
        salesChannel: user.salesChannel || '',
      });
    }
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = (data: ProfileUpdateFormData) => {
    updateMutation.mutate(
      {
        ownerName: data.name,
        businessName: data.businessName,
        email: data.email,
        phone: data.phone || undefined,
        address: data.address || undefined,
        cacNumber: data.cacNumber || undefined,
        businessType: data.businessType || undefined,
        businessSize: data.businessSize || undefined,
        salesChannel: data.salesChannel || undefined,
      },
      {
        onSuccess: () => {
          setEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  className={cn(errors.name && 'border-destructive')}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  className={cn(errors.businessName && 'border-destructive')}
                  {...register('businessName')}
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive">{errors.businessName.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className={cn(errors.email && 'border-destructive')}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register('address')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cacNumber">CAC Number</Label>
                <Input id="cacNumber" {...register('cacNumber')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input id="businessType" {...register('businessType')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="businessSize">Business Size</Label>
                <Input id="businessSize" {...register('businessSize')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="salesChannel">Sales Channel</Label>
                <Input id="salesChannel" {...register('salesChannel')} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Edit your personal and business information
            </p>
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
