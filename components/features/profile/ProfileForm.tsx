'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUpdateProfile, useUser } from '@/hooks/useAuth';
import { profileUpdateSchema, type ProfileUpdateFormData } from '@/lib/validations/auth';
import { getFieldErrors } from '@/lib/api/errors';
import { cn } from '@/lib/utils';

export function ProfileForm() {
  const { data: user } = useUser();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.ownerName || '',
        businessName: user.businessName || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = (data: ProfileUpdateFormData) => {
    updateMutation.mutate(
      {
        name: data.name,
        business_name: data.businessName,
        phone: data.phone,
      },
      {
        onSuccess: () => {
          reset({
            name: data.name,
            businessName: data.businessName,
            phone: data.phone,
          });
        },
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          for (const [field, message] of Object.entries(fieldErrors)) {
            if (field === 'name' || field === 'businessName' || field === 'business_name' || field === 'phone') {
              const target = field === 'business_name' ? 'businessName' : field;
              setError(target as 'name' | 'businessName' | 'phone', { message });
            }
          }
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
        <CardDescription>Update your name, business name and phone number.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" required>Full Name</Label>
              <Input
                id="name"
                aria-required="true"
                aria-invalid={!!errors.name}
                className={cn('h-11 sm:h-8', errors.name && 'border-destructive')}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="businessName">
                Business Name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="businessName"
                aria-invalid={!!errors.businessName}
                className={cn('h-11 sm:h-8', errors.businessName && 'border-destructive')}
                {...register('businessName')}
              />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="phone"
                placeholder="+2348012345678"
                aria-invalid={!!errors.phone}
                className={cn('h-11 sm:h-8', errors.phone && 'border-destructive')}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>
          <div className="flex">
            <Button
              type="submit"
              className="h-11 w-full sm:h-8 sm:w-auto"
              disabled={!isDirty || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
