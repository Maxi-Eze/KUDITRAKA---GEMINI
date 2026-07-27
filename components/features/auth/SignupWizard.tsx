'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface StepProps {
  currentStep: number;
}

function StepIndicator({ currentStep }: StepProps) {
  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Business' },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-2">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                currentStep > step.number && 'bg-primary text-primary-foreground',
                currentStep === step.number && 'bg-primary text-primary-foreground',
                currentStep < step.number && 'bg-border text-muted-foreground'
              )}
            >
              {currentStep > step.number ? (
                <Check className="w-4 h-4" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-20 h-0.5 mx-2 mb-5 transition-colors',
                currentStep > step.number ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface SignupWizardProps {
  className?: string;
}

export function SignupWizard({ className }: SignupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    sector: '',
    inventoryEnabled: false,
  });

  const passwordsMatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  return (
    <Card className={cn('w-full max-w-md shadow-lg shadow-black/20', className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-center mb-2 lg:hidden">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">K</span>
          </div>
        </div>
        <StepIndicator currentStep={currentStep} />
        <div className="text-center pt-2">
          <h2 className="text-2xl font-bold text-foreground">
            {currentStep === 1 ? 'Create your account' : 'Tell us about your business'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {currentStep === 1
              ? 'Start tracking your finances'
              : 'This helps us personalize your experience'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {currentStep === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className={cn(
                  'h-11',
                  formData.confirmPassword.length > 0 &&
                    !passwordsMatch &&
                    'border-destructive focus-visible:ring-destructive/20'
                )}
              />
              {formData.confirmPassword.length > 0 && (
                <p
                  className={cn(
                    'text-xs',
                    passwordsMatch ? 'text-primary' : 'text-destructive'
                  )}
                >
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Mama Ngozi Stores"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Business Sector</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => setFormData({ ...formData, sector: value ?? '' })}
              >
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
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="inventory" className="text-sm font-medium">
                    Inventory Tracking
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Track stock levels and get low-stock alerts
                  </p>
                </div>
                <Switch
                  id="inventory"
                  checked={formData.inventoryEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, inventoryEnabled: checked })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-2">
        <Button
          className="w-full transition-transform hover:scale-[1.02]"
          size="lg"
          onClick={() => {
            if (currentStep === 1) {
              setCurrentStep(2);
            }
          }}
        >
          {currentStep === 1 ? 'Next →' : 'Create Account'}
        </Button>

        {currentStep === 2 && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setCurrentStep(1)}
          >
            ← Back
          </Button>
        )}

        <Separator />

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
