import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { User } from '@/lib/types';

interface ProfileInfoProps {
  user: User;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const rows = [
    { label: 'Address', value: user.address },
    { label: 'CAC Number', value: user.cacNumber },
    { label: 'Business Type', value: user.businessType },
    { label: 'Business Size', value: user.businessSize },
    { label: 'Sales Channel', value: user.salesChannel },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>More details</CardTitle>
        <CardDescription>Additional business information.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="text-right text-sm font-medium">{row.value || 'Not set'}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          These fields aren&apos;t editable yet.
        </p>
      </CardContent>
    </Card>
  );
}
