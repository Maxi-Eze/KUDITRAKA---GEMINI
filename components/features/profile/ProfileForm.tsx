'use client';

import { useEffect } from 'react';
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
      });
    }
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = (data: ProfileUpdateFormData) => {
    updateMutation.mutate(
      {
        name: data.name,
        business_name: data.businessName,
      },
      {
        onSuccess: () => {
          reset({
            name: data.name,
            businessName: data.businessName,
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
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
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
