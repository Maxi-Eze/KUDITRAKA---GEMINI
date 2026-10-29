'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useUpdateProfile, useUser } from '@/hooks/useAuth';
import { profileUpdateSchema, type ProfileUpdateFormData } from '@/lib/validations/auth';
import { toNigerianInternational } from '@/lib/phone';
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
    // Always send +234… whatever format was typed (0803…, +234 803…).
    const phone = data.phone ? toNigerianInternational(data.phone) ?? data.phone : data.phone;
    updateMutation.mutate(
      {
        name: data.name,
        business_name: data.businessName,
        phone,
      },
      {
        onSuccess: () => {
          reset({
            name: data.name,
            businessName: data.businessName,
            phone,
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
        <CardTitle>Personal information</CardTitle>
        <CardDescription>Update your name, business name and phone number.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profile-name" required>Full name</FieldLabel>
              <Input
                id="profile-name"
                aria-required="true"
                aria-invalid={!!errors.name}
                className={cn('h-11 sm:h-10', errors.name && 'border-destructive')}
                {...register('name')}
              />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-businessName">Business name</FieldLabel>
              <Input
                id="profile-businessName"
                aria-invalid={!!errors.businessName}
                className={cn('h-11 sm:h-10', errors.businessName && 'border-destructive')}
                {...register('businessName')}
              />
              <FieldError errors={errors.businessName ? [errors.businessName] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-phone">Phone number</FieldLabel>
              <Input
                id="profile-phone"
                placeholder="0803 456 7890"
                aria-invalid={!!errors.phone}
                className={cn('h-11 sm:h-10', errors.phone && 'border-destructive')}
                {...register('phone')}
              />
              <FieldError errors={errors.phone ? [errors.phone] : undefined} />
            </Field>
          </FieldGroup>

          <div className="mt-6 flex">
            <Button
              type="submit"
              className="h-11 w-full sm:h-10 sm:w-auto"
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
