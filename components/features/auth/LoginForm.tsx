'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2, Phone, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { cn } from '@/lib/utils';
import { useLogin, useStaffLogin } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { PHONE_ERROR, toNigerianInternational } from '@/lib/phone';

interface LoginFormProps {
  className?: string;
}

type LoginMode = 'owner' | 'staff';

/** Staff log in with the phone number and 6-digit PIN the shop owner gave them. */
function StaffLoginFields() {
  const staffLogin = useStaffLogin();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const international = toNigerianInternational(phone);
    if (!international) return setError(PHONE_ERROR);
    if (!/^\d{6}$/.test(pin)) return setError('Enter the 6-digit PIN');
    setError(null);
    staffLogin.mutate({ phone: international, pin });
  };

  return (
    <form onSubmit={submit} noValidate>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="staff-phone" required>Phone number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="staff-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 456 7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="staff-pin" required>PIN</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="staff-pin"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="pl-9 h-11 tracking-[0.3em]"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-2">
        <Button type="submit" className="w-full" size="lg" disabled={staffLogin.isPending}>
          {staffLogin.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Log in'
          )}
        </Button>
        <p className="text-sm text-muted-foreground text-center">Forgot your PIN? Ask the shop owner for a new one.</p>
      </CardFooter>
    </form>
  );
}

export function LoginForm({ className }: LoginFormProps) {
  const login = useLogin();
  const [mode, setMode] = useState<LoginMode>('owner');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  return (
    <Card className={cn('w-full max-w-md shadow-lg shadow-black/20', className)}>
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2 lg:hidden">
          <BrandLogo variant="icon" className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{mode === 'owner' ? 'Welcome back' : 'Staff login'}</h2>
        <p className="text-muted-foreground">
          {mode === 'owner' ? 'Sign in to your account' : 'Use the phone number and PIN from the shop owner'}
        </p>
        <div role="tablist" aria-label="Who is logging in" className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(['owner', 'staff'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'rounded-md py-1.5 text-sm font-medium transition-colors',
                mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 'owner' ? 'Owner' : 'Staff'}
            </button>
          ))}
        </div>
      </CardHeader>

      {mode === 'staff' ? <StaffLoginFields /> : (
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" required>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                aria-required="true"
                aria-invalid={!!errors.email}
                className={cn('pl-9 h-11', errors.email && 'border-destructive')}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" required>Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                aria-required="true"
                aria-invalid={!!errors.password}
                className={cn('pl-9 h-11', errors.password && 'border-destructive')}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full transition-transform hover:scale-[1.02]"
            size="lg"
            disabled={login.isPending}
          >
            {login.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <Separator />

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
      )}
    </Card>
  );
}
