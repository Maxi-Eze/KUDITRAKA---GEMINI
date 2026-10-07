import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import type { User } from '@/lib/types';

interface ProfileInfoProps {
  user: User;
}

function InfoField({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || 'Not set'}</p>
    </div>
  );
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>More details</CardTitle>
        <CardDescription>Additional business information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoField label="Address" value={user.address} />
          <InfoField label="CAC Number" value={user.cacNumber} />
          <InfoField label="Business Type" value={user.businessType} />
          <InfoField label="Business Size" value={user.businessSize} />
          <InfoField label="Sales Channel" value={user.salesChannel} />
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            These fields aren&apos;t editable yet.{' '}
            <Badge variant="outline" className="ml-1 align-middle text-[10px]">
              Coming soon
            </Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
