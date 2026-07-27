'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUpdateProfile, useUser } from '@/hooks/useAuth';

export function ProfileForm() {
  const { data: user } = useUser();
  const updateMutation = useUpdateProfile();
  const [editing, setEditing] = useState(false);

  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessSize, setBusinessSize] = useState('');
  const [salesChannel, setSalesChannel] = useState('');

  useEffect(() => {
    if (user) {
      setOwnerName(user.ownerName || '');
      setBusinessName(user.businessName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCacNumber(user.cacNumber || '');
      setBusinessType(user.businessType || '');
      setBusinessSize(user.businessSize || '');
      setSalesChannel(user.salesChannel || '');
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    if (!ownerName || !businessName || !email) return;

    updateMutation.mutate(
      {
        ownerName,
        businessName,
        email,
        phone: phone || undefined,
        address: address || undefined,
        cacNumber: cacNumber || undefined,
        businessType: businessType || undefined,
        businessSize: businessSize || undefined,
        salesChannel: salesChannel || undefined,
      },
      {
        onSuccess: () => {
          setEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setOwnerName(user.ownerName || '');
    setBusinessName(user.businessName || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setCacNumber(user.cacNumber || '');
    setBusinessType(user.businessType || '');
    setBusinessSize(user.businessSize || '');
    setSalesChannel(user.salesChannel || '');
    setEditing(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ownerName">Name</Label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cacNumber">CAC Number</Label>
                <Input
                  id="cacNumber"
                  value={cacNumber}
                  onChange={(e) => setCacNumber(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="businessSize">Business Size</Label>
                <Input
                  id="businessSize"
                  value={businessSize}
                  onChange={(e) => setBusinessSize(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="salesChannel">Sales Channel</Label>
                <Input
                  id="salesChannel"
                  value={salesChannel}
                  onChange={(e) => setSalesChannel(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!ownerName || !businessName || !email || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
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